"""
Main application with Weaviate and Neo4j integration
"""
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv
import logging

# Import database clients
from app.db.weaviate import weaviate_client
from app.db.neo4j_client import neo4j_client

# PDF parsing
try:
    import fitz  # PyMuPDF
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: PyMuPDF not available. PDF parsing will be limited.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Smart Multi-Modal Education Tutor API with Weaviate & Neo4j")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama configuration
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")

# Database connection flags
USE_WEAVIATE = os.getenv("USE_WEAVIATE", "true").lower() == "true"
USE_NEO4J = os.getenv("USE_NEO4J", "true").lower() == "true"

# Fallback in-memory storage
document_store: Dict[str, Dict] = {}
knowledge_graph = {"nodes": [], "links": []}

# Query tracking for metrics
query_history = []
query_latencies = []

@app.on_event("startup")
async def startup_event():
    """Initialize database connections on startup"""
    logger.info("Starting application...")
    
    # Connect to Weaviate
    if USE_WEAVIATE:
        logger.info("Connecting to Weaviate...")
        if weaviate_client.connect():
            logger.info("✅ Weaviate connected successfully")
        else:
            logger.warning("⚠️  Weaviate connection failed, using in-memory storage")
    
    # Connect to Neo4j
    if USE_NEO4J:
        logger.info("Connecting to Neo4j...")
        if neo4j_client.connect():
            logger.info("✅ Neo4j connected successfully")
        else:
            logger.warning("⚠️  Neo4j connection failed, using in-memory graph")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    logger.info("Shutting down application...")
    
    if weaviate_client.connected:
        weaviate_client.close()
    
    if neo4j_client.connected:
        neo4j_client.close()

def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF using PyMuPDF"""
    if not PDF_AVAILABLE:
        return "[PDF parsing not available - PyMuPDF not installed]"
    
    try:
        pdf_document = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            text += page.get_text()
            text += "\n\n"
        pdf_document.close()
        return text.strip()
    except Exception as e:
        return f"[Error parsing PDF: {str(e)}]"

def extract_concepts(text: str) -> List[str]:
    """Extract concepts from text using keyword matching"""
    text_lower = text.lower()
    concepts = set()
    
    concept_keywords = {
        "DevOps": ["devops", "dev ops"],
        "CI/CD": ["ci/cd", "continuous integration", "pipeline"],
        "Docker": ["docker", "container"],
        "Kubernetes": ["kubernetes", "k8s"],
        "Cloud Computing": ["cloud computing", "cloud"],
        "Machine Learning": ["machine learning", "ml"],
        "Neural Networks": ["neural network", "deep learning"],
        "Database": ["database", "sql", "nosql"],
        "Testing": ["testing", "test", "qa"],
        "Security": ["security", "encryption", "cybersecurity"],
        "Monitoring": ["monitoring", "observability"],
        "Automation": ["automation", "automated"],
        "Version Control": ["git", "version control"],
        "AWS": ["aws", "amazon web services"],
        "Encryption": ["encryption", "decrypt"],
    }
    
    for concept, keywords in concept_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                concepts.add(concept)
                break
    
    return list(concepts)

def add_to_graph(node_id: str, node_type: str = "Concept"):
    """Add node to Neo4j or fallback to in-memory"""
    if USE_NEO4J and neo4j_client.connected:
        neo4j_client.add_node(node_id, node_type)
    else:
        # Fallback to in-memory
        for n in knowledge_graph["nodes"]:
            if n["id"] == node_id:
                return
        knowledge_graph["nodes"].append({"id": node_id, "val": 5})

def add_relationship(source: str, target: str):
    """Add relationship to Neo4j or fallback to in-memory"""
    if USE_NEO4J and neo4j_client.connected:
        neo4j_client.add_relationship(source, target, "RELATES_TO")
    else:
        # Fallback to in-memory
        for l in knowledge_graph["links"]:
            if l["source"] == source and l["target"] == target:
                return
        knowledge_graph["links"].append({"source": source, "target": target})

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    import requests
    
    # Check Ollama
    ollama_available = False
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
        ollama_available = response.status_code == 200
    except:
        pass
    
    # Get document count
    if USE_WEAVIATE and weaviate_client.connected:
        docs = weaviate_client.get_all_documents()
        doc_count = len(docs)
    else:
        doc_count = len(document_store)
    
    # Get graph stats
    if USE_NEO4J and neo4j_client.connected:
        graph = neo4j_client.get_graph()
        graph_nodes = len(graph["nodes"])
        graph_links = len(graph["links"])
    else:
        graph_nodes = len(knowledge_graph["nodes"])
        graph_links = len(knowledge_graph["links"])
    
    return {
        "status": "healthy",
        "documents": doc_count,
        "graph_nodes": graph_nodes,
        "graph_links": graph_links,
        "pdf_support": PDF_AVAILABLE,
        "llm_available": ollama_available,
        "llm_model": OLLAMA_MODEL if ollama_available else "none",
        "weaviate_connected": weaviate_client.connected if USE_WEAVIATE else False,
        "neo4j_connected": neo4j_client.connected if USE_NEO4J else False,
        "using_weaviate": USE_WEAVIATE and weaviate_client.connected,
        "using_neo4j": USE_NEO4J and neo4j_client.connected
    }

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    metadata: Optional[str] = Form(None)
):
    """Upload and process document"""
    content_type = file.content_type or "application/octet-stream"
    filename = file.filename
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Extract text
    text_content = ""
    if filename.endswith('.pdf'):
        text_content = extract_text_from_pdf(content)
    elif filename.endswith(('.txt', '.md')):
        try:
            text_content = content.decode('utf-8')
        except:
            text_content = content.decode('latin-1', errors='ignore')
    else:
        text_content = f"[Binary file: {filename}]"
    
    # Extract concepts
    concepts = extract_concepts(filename + " " + text_content)
    
    # Store in Weaviate or fallback
    if USE_WEAVIATE and weaviate_client.connected:
        weaviate_client.add_document(filename, text_content, content_type, concepts)
    else:
        document_store[filename] = {
            "content": text_content,
            "type": content_type,
            "size": file_size,
            "concepts": concepts
        }
    
    # Add to graph
    add_to_graph("Documents", "Category")
    add_to_graph(filename, "Document")
    add_relationship("Documents", filename)
    
    for concept in concepts:
        add_to_graph(concept, "Concept")
        add_relationship(filename, concept)
    
    return {
        "message": f"Successfully processed {filename}",
        "content_type": content_type,
        "file_size": file_size,
        "text_length": len(text_content),
        "concepts_extracted": concepts,
        "stored_in": "Weaviate" if (USE_WEAVIATE and weaviate_client.connected) else "Memory",
        "graph_in": "Neo4j" if (USE_NEO4J and neo4j_client.connected) else "Memory",
        "status": "complete"
    }

# Continue with remaining endpoints...
# (I'll add the rest in the next message to keep it manageable)

if __name__ == "__main__":
    uvicorn.run("main_with_dbs:app", host="0.0.0.0", port=8000, reload=True)
