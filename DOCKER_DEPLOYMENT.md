# Docker Deployment Guide

## Quick Start

### Windows

```bash
docker-start.bat
```

### Linux/Mac

```bash
chmod +x docker-start.sh
./docker-start.sh
```

## Manual Setup

### 1. Prerequisites

- Docker Desktop installed and running
- Ollama running on host (optional, for LLM features)
- At least 8GB RAM available
- 10GB disk space for models

### 2. Build and Start

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### 3. Verify

```bash
# Check health
curl http://localhost:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "documents": 0,
#   "pdf_support": true,
#   "vision_available": true,
#   "audio_available": true,
#   "embedding_available": true,
#   "llm_available": true
# }
```

## Services

### Backend (Port 8000)
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

**Features:**
- Multi-modal RAG (text, image, audio)
- Embedding-based search
- Semantic understanding
- Intelligent reranking
- Adaptive fusion

### Weaviate (Port 8080)
- **URL**: http://localhost:8080
- **Purpose**: Vector database (optional)
- **Status**: Running but not yet integrated

### Neo4j (Port 7474, 7687)
- **Browser**: http://localhost:7474
- **Bolt**: bolt://localhost:7687
- **Credentials**: neo4j / password
- **Purpose**: Knowledge graph (optional)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Host                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Backend    │  │   Weaviate   │  │    Neo4j     │ │
│  │   :8000      │  │   :8080      │  │  :7474/:7687 │ │
│  │              │  │              │  │              │ │
│  │ • FastAPI    │  │ • Vector DB  │  │ • Graph DB   │ │
│  │ • Embeddings │  │ • Optional   │  │ • Optional   │ │
│  │ • RAG        │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                                               │
│         └─────────────────────────────────────────────┐ │
│                                                       │ │
│  ┌────────────────────────────────────────────────┐  │ │
│  │  Ollama (on host)                              │  │ │
│  │  :11434                                        │  │ │
│  │  • LLM for answer generation                   │  │ │
│  └────────────────────────────────────────────────┘  │ │
│                                                       │ │
└───────────────────────────────────────────────────────┘ │
                                                          │
                                                          │
┌─────────────────────────────────────────────────────────┘
│  Persistent Volumes
│  • model-cache (HuggingFace models)
│  • whisper-cache (Whisper models)
│  • weaviate-data (Vector DB data)
│  • neo4j-data (Graph DB data)
└─────────────────────────────────────────────────────────┘
```

## Models Downloaded

The backend container will download these models on first startup:

1. **Text Embeddings**: sentence-transformers/all-MiniLM-L6-v2 (~90MB)
2. **Image Embeddings**: CLIP-vit-base-patch32 (~600MB)
3. **Audio Transcription**: Whisper base (~140MB)

**Total**: ~830MB

**First startup time**: 10-15 minutes (models are cached for subsequent runs)

## Volume Management

### View Volumes

```bash
docker volume ls | grep te-main
```

### Clear Cache (force model re-download)

```bash
docker volume rm te-main_model-cache
docker volume rm te-main_whisper-cache
```

### Backup Data

```bash
# Backup Weaviate data
docker run --rm -v te-main_weaviate-data:/data -v $(pwd):/backup alpine tar czf /backup/weaviate-backup.tar.gz /data

# Backup Neo4j data
docker run --rm -v te-main_neo4j-data:/data -v $(pwd):/backup alpine tar czf /backup/neo4j-backup.tar.gz /data
```

## Environment Variables

Edit `docker-compose.yml` to customize:

```yaml
environment:
  - OLLAMA_URL=http://host.docker.internal:11434
  - OLLAMA_MODEL=llama2  # or mistral, phi, etc.
  - WEAVIATE_URL=http://weaviate:8080
  - NEO4J_URI=bolt://neo4j:7687
  - NEO4J_USER=neo4j
  - NEO4J_PASSWORD=password
```

## Testing

### 1. Upload a File

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@test.pdf"
```

### 2. Query

```bash
curl -X POST "http://localhost:8000/upload" \
  -F "query=explain neural networks" \
  -F "session_id=test"
```

### 3. Check Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Troubleshooting

### Backend not starting

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Models downloading (wait 10-15 min)
# 2. Out of memory (increase Docker RAM to 8GB+)
# 3. Port 8000 already in use (stop other services)
```

### Ollama not accessible

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# If not running:
ollama serve

# Check Docker can access host
docker-compose exec backend curl http://host.docker.internal:11434/api/tags
```

### Models not loading

```bash
# Clear cache and rebuild
docker-compose down -v
docker-compose build --no-cache backend
docker-compose up -d
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

## Performance Tuning

### Increase Docker Resources

**Docker Desktop → Settings → Resources:**
- **CPUs**: 4+ cores
- **Memory**: 8GB+ RAM
- **Disk**: 20GB+ available

### Use GPU (Optional)

For faster inference, enable GPU support:

1. Install NVIDIA Docker runtime
2. Update `docker-compose.yml`:

```yaml
backend:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

## Production Deployment

### Security

1. **Change default passwords**:
   ```yaml
   NEO4J_PASSWORD: your-secure-password
   ```

2. **Disable anonymous access**:
   ```yaml
   AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'false'
   ```

3. **Use secrets management**:
   ```bash
   docker secret create neo4j_password password.txt
   ```

### Scaling

```bash
# Scale backend
docker-compose up -d --scale backend=3

# Use load balancer (nginx, traefik)
```

### Monitoring

```bash
# Resource usage
docker stats

# Health checks
watch -n 5 'curl -s http://localhost:8000/health | jq'
```

## Stopping

```bash
# Stop services (keep data)
docker-compose stop

# Stop and remove containers (keep data)
docker-compose down

# Stop and remove everything (including data)
docker-compose down -v
```

## Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Support

### View System Info

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Disk usage
docker system df
```

### Export Logs

```bash
# Save logs to file
docker-compose logs > system-logs.txt

# Last 1000 lines
docker-compose logs --tail=1000 > recent-logs.txt
```

## Next Steps

1. ✅ Start system: `docker-start.bat` or `./docker-start.sh`
2. ✅ Verify health: `curl http://localhost:8000/health`
3. ✅ Upload files: Use `/upload` endpoint
4. ✅ Query system: Use `/query` endpoint
5. ✅ Check docs: http://localhost:8000/docs

**The system is ready to use!** 🚀
