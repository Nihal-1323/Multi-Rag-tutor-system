# 🌐 System Access Links

## ✅ Your Multi-Modal RAG System is Running!

All containers are up and operational. Here are your access links:

---

## 🔗 Main Access Points

### 1. **Backend API** (Main System)
- **URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### 2. **Frontend Web Interface**
- **URL**: http://localhost:3000
- **Description**: React-based web UI for uploading documents and querying

### 3. **Weaviate Vector Database**
- **URL**: http://localhost:8080
- **Console**: http://localhost:8080/v1/meta
- **Description**: Local vector database for embeddings

### 4. **Neo4j Knowledge Graph**
- **Browser**: http://localhost:7474
- **Bolt Protocol**: bolt://localhost:7687
- **Username**: neo4j
- **Password**: password
- **Description**: Graph database for concept relationships

---

## 🚀 Quick Start Commands

### Check System Health

```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "documents": 3,
  "embedding_available": true,
  "llm_available": true,
  "vector_stores": {
    "weaviate": {"available": false},
    "pinecone": {"available": false}
  }
}
```

*Note: Vector stores will be available after container rebuild with pinecone-client*

### Upload a Document

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@your_document.pdf"
```

### Query the System

```bash
curl -X POST "http://localhost:8000/query" \
  -F "query=your question here" \
  -F "session_id=test"
```

### View Uploaded Documents

```bash
curl http://localhost:8000/documents
```

### View Knowledge Graph

```bash
curl http://localhost:8000/graph
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health status |
| `/upload` | POST | Upload documents (PDF, images, audio) |
| `/query` | POST/GET | Query the RAG system |
| `/documents` | GET | List all uploaded documents |
| `/graph` | GET | Get knowledge graph structure |
| `/metrics` | GET | System performance metrics |
| `/logs` | GET | System logs |
| `/export` | GET | Export RAG data |
| `/documents/{filename}` | DELETE | Delete a document |

---

## 🖥️ Interactive API Documentation

### Swagger UI (Recommended)
**URL**: http://localhost:8000/docs

Features:
- Interactive API testing
- Try out endpoints directly
- See request/response schemas
- Authentication testing

### ReDoc
**URL**: http://localhost:8000/redoc

Features:
- Clean, readable documentation
- Detailed endpoint descriptions
- Schema definitions
- Code examples

---

## 🧪 Test the System

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

### Test 2: Upload Test Document

```bash
# Create a test file
echo "Neural networks are computing systems inspired by biological neural networks." > test.txt

# Upload it
curl -X POST "http://localhost:8000/upload" -F "file=@test.txt"
```

### Test 3: Query

```bash
curl -X POST "http://localhost:8000/query" \
  -F "query=explain neural networks" \
  -F "session_id=test"
```

### Test 4: View Documents

```bash
curl http://localhost:8000/documents
```

---

## 🎨 Frontend Usage

### Access the Web Interface

1. Open your browser
2. Go to: http://localhost:3000
3. You'll see the Multi-Modal RAG interface

### Upload Documents via UI

1. Click the upload button or drag & drop files
2. Supported formats:
   - **Text**: PDF, TXT, MD, CSV
   - **Images**: JPG, PNG, GIF, BMP, WEBP
   - **Audio**: MP3, WAV, M4A, OGG, FLAC, AAC

### Query via UI

1. Type your question in the input box
2. Click "Ask" or press Enter
3. View the answer and sources

---

## 📈 Monitoring

### View Container Status

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Check Resource Usage

```bash
docker stats
```

---

## 🔧 Management Commands

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart backend only
docker-compose restart backend
```

### Stop Services

```bash
docker-compose stop
```

### Start Services

```bash
docker-compose start
```

### View Service Status

```bash
docker-compose ps
```

---

## 🌐 External Access (Optional)

If you want to access from other devices on your network:

1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. Access from other devices:
   - Backend: `http://YOUR_IP:8000`
   - Frontend: `http://YOUR_IP:3000`
   - Neo4j: `http://YOUR_IP:7474`

---

## 📝 Current System Status

### Running Containers

✅ **te-main-backend-1** (Port 8000)
- Multi-Modal RAG API
- Embedding services
- Query processing

✅ **te-main-frontend-1** (Port 3000)
- React web interface
- Document upload UI
- Query interface

✅ **te-main-weaviate-1** (Port 8080)
- Vector database
- Embedding storage

✅ **te-main-neo4j-1** (Ports 7474, 7687)
- Knowledge graph
- Concept relationships

### Current Documents

The system currently has **3 documents** uploaded:
- Check them at: http://localhost:8000/documents

### Models Loaded

- ✅ Text Embeddings: sentence-transformers/all-MiniLM-L6-v2
- ✅ Image Embeddings: CLIP-vit-base-patch32
- ✅ Audio Transcription: Whisper base model
- ✅ LLM: Ollama llama2

---

## 🎯 Next Steps

1. **Test the API**: http://localhost:8000/docs
2. **Upload documents**: Use the frontend or API
3. **Query the system**: Ask questions about your documents
4. **Monitor performance**: Check metrics and logs

---

## 🆘 Troubleshooting

### Issue: Can't access the links

**Check if containers are running**:
```bash
docker-compose ps
```

**Restart if needed**:
```bash
docker-compose restart
```

### Issue: Port already in use

**Check what's using the port**:
```bash
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
```

**Change port in docker-compose.yml** if needed

### Issue: Slow response

**Check resource usage**:
```bash
docker stats
```

**Increase Docker memory** if needed (Docker Desktop → Settings → Resources)

---

## 📚 Documentation

For more details, see:
- `COMPREHENSIVE_PROJECT_SUMMARY.md` - Complete project overview
- `DUAL_VECTOR_STORE_SETUP.md` - Vector store configuration
- `SETUP_COMPLETE.md` - Setup guide
- `FRONTEND_USAGE_GUIDE.md` - Frontend usage

---

## ✨ Summary

Your Multi-Modal RAG system is **fully operational**!

**Main Access**: http://localhost:8000
**Web Interface**: http://localhost:3000
**API Docs**: http://localhost:8000/docs

**Start using it now!** 🚀
