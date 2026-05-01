import weaviate
from neo4j import GraphDatabase
import os
from sentence_transformers import CrossEncoder

class HybridRetriever:
    def __init__(self):
        # Weaviate connection
        self.weaviate_client = weaviate.Client(
            url=os.getenv("WEAVIATE_URL", "http://localhost:8080")
        )
        
        # Neo4j connection
        self.neo4j_driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            auth=(os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "password"))
        )
        
        # Cross-Encoder Reranker
        self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

    def close(self):
        self.neo4j_driver.close()

    def vector_search(self, query: str, top_k: int = 5):
        """Perform vector search in Weaviate."""
        result = (
            self.weaviate_client.query
            .get("EducationContent", ["text", "source", "modality"])
            .with_near_text({"concepts": [query]})
            .with_limit(top_k)
            .do()
        )
        return result.get("data", {}).get("Get", {}).get("EducationContent", [])

    def graph_traversal(self, concepts: list):
        """Extract relevant sub-graph from Neo4j based on concepts."""
        with self.neo4j_driver.session() as session:
            # Query for concepts and their neighbors
            query = """
            MATCH (n:Concept)-[r]-(m:Concept)
            WHERE n.name IN $concepts
            RETURN n.name as source, type(r) as relationship, m.name as target
            LIMIT 20
            """
            result = session.run(query, concepts=concepts)
            return [record.data() for record in result]

    def hybrid_retrieve(self, query: str):
        # 1. Vector Search
        vector_results = self.vector_search(query)
        
        # 2. Extract concepts for graph search (simplified)
        # In production, use NLP to extract entities/concepts from query
        concepts = [query] # Placeholder
        
        # 3. Graph Retrieval
        graph_results = self.graph_traversal(concepts)
        
        # 4. Merge & Rerank
        all_texts = [res['text'] for res in vector_results]
        # Pair query with each result for cross-encoder
        pairs = [[query, text] for text in all_texts]
        scores = self.reranker.predict(pairs)
        
        # Sort results by rerank score
        reranked_results = sorted(
            zip(vector_results, scores),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            "reranked_vector_context": [r[0] for r in reranked_results],
            "graph_context": graph_results
        }
