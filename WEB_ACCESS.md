# 🌐 Web Access - Multi-Modal RAG System

## ✅ System Status: RUNNING

All Docker containers are operational and ready to use!

---

## 🔗 Access Links

### 1. **Backend API** (Main Service)
**URL**: http://localhost:8000

**Features**:
- Multi-modal RAG queries (text, image, audio)
- File upload endpoint
- Semantic search with embeddings
- Intelligent reranking
- Adaptive fusion

**Quick Test**:
```bash
curl http://localhost:8000/health
```

---

### 2. **API Documentation** (Interactive)
**URL**: http://localhost:8000/docs

**Features**:
- Interactive API explorer (Swagger UI)
- Test all endpoints directly in browser
- View request/response schemas
- Try out file uploads and queries

**How to Use**:
1. Open http://localhost:8000/docs in your browser
2. Click on any endpoint to expand it
3. Click "Try it out" button
4. Fill in parameters
5. Click "Execute" to test

---

### 3. **Frontend Web Interface**
**URL**: http://localhost:3000

**Features**:
- User-friendly web interface
- Upload documents (PDF, images, audio)
- Ask questions
- View results with sources
- Knowledge graph visualization

**Note**: Frontend may need configuration to connect to backend

---

### 4. **Neo4j Browser** (Knowledge Graph)
**URL**: http://localhost:7474

**Credentials**:
- Username: `neo4j`
- Password: `password`

**Features**:
- Visualize knowledge graph
- Run Cypher queries
- Explore relationships
- View document connections

**Example Query**:
```cypher
MATCH (n) RETURN n LIMIT 25
```

---

### 5. **Weaviate Console** (Vector Database)
**URL**: http://localhost:8080

**Features**:
- Vector database management
- View stored embeddings
- Query vectors
- Schema exploration

---

## 🚀 Quick Start Guide

### Step 1: Upload a Document

**Using Browser (API Docs)**:
1. Go to http://localhost:8000/docs
2. Find `/upload` endpoint
3. Click "Try it out"
4. Choose a file (PDF, image, or audio)
5. Click "Execute"

**Using Command Line**:
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@your_document.pdf"
```

---

### Step 2: Ask a Question

**Using Browser (API Docs)**:
1. Go to http://localhost:8000/docs
2. Find `/query` endpoint
3. Click "Try it out"
4. Enter your query: "explain neural networks"
5. Enter session_id: "test"
6. Click "Execute"

**Using Command Line**:
```bash
curl -X POST "http://localhost:8000/query" \
  -F "query=explain neural networks" \
  -F "session_id=test"
```

---

### Step 3: View Results

The response will include:
- **answer**: Generated answer from your documents
- **sources**: List of source documents used
- **confidence**: Confidence scores for each modality
- **mode**: Fusion mode used (text_only, image_only, hybrid)
- **debug**: Detailed pipeline information

---

## 📊 System Information

**Current Status**:
```json
{
  "status": "healthy",
  "documents": 3,
  "graph_nodes": 8,
  "graph_links": 7,
  "pdf_support": true,
  "vision_available": true,
  "audio_available": true,
  "embedding_available": true,
  "llm_available": true,
  "llm_model": "llama2"
}
```

**Loaded Models**:
- ✅ Text Embeddings: sentence-transformers/all-MiniLM-L6-v2
- ✅ Image Embeddings: CLIP-vit-base-patch32
- ✅ Audio Transcription: Whisper base
- ✅ Vision Analysis: Ollama llava
- ✅ LLM Generation: Ollama llama2

---

## 🎯 Example Queries

### Text Query
```bash
curl -X POST "http://localhost:8000/query" \
  -F "query=what is backpropagation" \
  -F "session_id=demo"
```

### Image Query
```bash
curl -X POST "http://localhost:8000/query" \
  -F "query=what color is in the image" \
  -F "session_id=demo"
```

### Audio Query
```bash
curl -X POST "http://localhost:8000/query" \
  -F "query=what was said in the recording" \
  -F "session_id=demo"
```

---

## 🛠️ Management

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend
```

### Restart Services
```bash
# Restart backend
docker-compose restart backend

# Restart all
docker-compose restart
```

### Stop System
```bash
docker-compose stop
```

### Start System
```bash
docker-compose up -d
```

---

## 📱 Access from Other Devices

To access from other devices on your network:

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. Replace `localhost` with your IP:
   - Backend: `http://YOUR_IP:8000`
   - Frontend: `http://YOUR_IP:3000`
   - Neo4j: `http://YOUR_IP:7474`

**Example**: If your IP is `192.168.1.100`:
- Backend: http://192.168.1.100:8000
- Frontend: http://192.168.1.100:3000

---

## 🎨 Interactive API Explorer

The best way to explore the system is through the **Swagger UI**:

**URL**: http://localhost:8000/docs

**Available Endpoints**:

1. **GET /health** - Check system status
2. **POST /upload** - Upload documents (PDF, images, audio)
3. **POST /query** - Ask questions
4. **GET /documents** - List uploaded documents
5. **GET /graph** - Get knowledge graph
6. **GET /metrics** - System metrics

---

## 💡 Tips

1. **Start with API Docs**: http://localhost:8000/docs is the easiest way to test
2. **Upload First**: Upload some documents before querying
3. **Check Health**: Use `/health` endpoint to verify all services are ready
4. **View Logs**: Use `docker-compose logs -f backend` to see what's happening
5. **Test Modalities**: Try text, image, and audio queries to see multi-modal capabilities

---

## 🔍 Troubleshooting

### Can't Access Web Interface?

**Check if services are running**:
```bash
docker-compose ps
```

**Check if ports are accessible**:
```bash
curl http://localhost:8000/health
```

**View logs for errors**:
```bash
docker-compose logs backend
```

### Getting Connection Errors?

1. Make sure Docker is running
2. Check firewall settings
3. Verify ports 8000, 3000, 7474, 8080 are not blocked
4. Try restarting services: `docker-compose restart`

---

## 📚 Documentation

- **Architecture**: See `GENERAL_MULTIMODAL_RAG_ARCHITECTURE.md`
- **Deployment**: See `DOCKER_DEPLOYMENT.md`
- **Success Report**: See `DOCKER_DEPLOYMENT_SUCCESS.md`
- **System Comparison**: See `SYSTEM_COMPARISON.md`

---

## ✨ Summary

**Your multi-modal RAG system is live at:**

🌐 **Main API**: http://localhost:8000
📖 **API Docs**: http://localhost:8000/docs
🎨 **Frontend**: http://localhost:3000
🔗 **Neo4j**: http://localhost:7474
💾 **Weaviate**: http://localhost:8080

**Start exploring now!** 🚀
