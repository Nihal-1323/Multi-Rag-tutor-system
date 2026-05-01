# Docker Setup with Weaviate & Neo4j

## Overview

This guide will help you run the system with:
- **Weaviate**: Vector database for document storage and semantic search
- **Neo4j**: Graph database for knowledge graph and concept relationships
- **Docker**: Containerized deployment for all services

## Prerequisites

1. **Docker Desktop** installed and running
   - Windows: Download from https://www.docker.com/products/docker-desktop
   - Check: `docker --version` and `docker-compose --version`

2. **Ports Available**:
   - 3000 (Frontend)
   - 8000 (Backend)
   - 8080 (Weaviate)
   - 7474, 7687 (Neo4j)

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Manual Docker Setup

```bash
# 1. Start Weaviate
docker run -d \
  --name weaviate \
  -p 8080:8080 \
  -e QUERY_DEFAULTS_LIMIT=25 \
  -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
  -e PERSISTENCE_DATA_PATH=/var/lib/weaviate \
  semitechnologies/weaviate:1.24.1

# 2. Start Neo4j
docker run -d \
  --name neo4j \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5.16.0

# 3. Install Python dependencies
cd backend
pip install weaviate-client==4.4.0 neo4j==5.16.0

# 4. Start backend (with databases)
python main_with_dbs.py

# 5. Start frontend (in another terminal)
npm run dev
```

## Configuration

### Environment Variables

Create `.env` file in the backend directory:

```env
# Weaviate Configuration
WEAVIATE_URL=http://localhost:8080
USE_WEAVIATE=true

# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
USE_NEO4J=true

# Ollama (optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## Verification

### 1. Check Weaviate

```bash
# Test Weaviate connection
curl http://localhost:8080/v1/.well-known/ready

# Should return: {"status": "ok"}
```

### 2. Check Neo4j

Open browser: http://localhost:7474

- Username: `neo4j`
- Password: `password`

Run query: `MATCH (n) RETURN count(n)`

### 3. Check Backend

```bash
curl http://localhost:8000/health
```

Should show:
```json
{
  "status": "healthy",
  "weaviate_connected": true,
  "neo4j_connected": true,
  "using_weaviate": true,
  "using_neo4j": true
}
```

### 4. Check Frontend

Open browser: http://localhost:3000

## Using the System

### 1. Upload Documents

Documents are now stored in **Weaviate** instead of memory:
- Better search capabilities
- Persistent storage
- Semantic similarity search

### 2. Knowledge Graph

Concepts and relationships are stored in **Neo4j**:
- Persistent graph structure
- Advanced graph queries
- Relationship traversal

### 3. Query System

Queries now use:
- **Weaviate** for document retrieval
- **Neo4j** for concept relationships
- **Hybrid search** combining both

## Advantages

### Weaviate Benefits:
✅ **Vector Search**: Semantic similarity matching
✅ **Scalability**: Handles large document collections
✅ **Persistence**: Data survives restarts
✅ **BM25 Search**: Keyword-based retrieval
✅ **Hybrid Search**: Combine vector + keyword

### Neo4j Benefits:
✅ **Graph Queries**: Complex relationship traversal
✅ **Cypher Language**: Powerful query language
✅ **Visualization**: Built-in graph browser
✅ **Persistence**: Graph survives restarts
✅ **Relationships**: Track concept connections

## Troubleshooting

### Weaviate Not Connecting

```bash
# Check if Weaviate is running
docker ps | grep weaviate

# Check Weaviate logs
docker logs weaviate

# Restart Weaviate
docker restart weaviate
```

### Neo4j Not Connecting

```bash
# Check if Neo4j is running
docker ps | grep neo4j

# Check Neo4j logs
docker logs neo4j

# Restart Neo4j
docker restart neo4j
```

### Backend Can't Connect

1. Check environment variables in `.env`
2. Verify Weaviate and Neo4j are running
3. Check firewall/port settings
4. Look at backend logs for connection errors

### Fallback Mode

If databases fail to connect, the system automatically falls back to in-memory storage:

```
⚠️  Weaviate connection failed, using in-memory storage
⚠️  Neo4j connection failed, using in-memory graph
```

The system will still work, but without persistence.

## Docker Compose Services

The `docker-compose.yml` defines 4 services:

### 1. Frontend
- Port: 3000
- Built from: `docker/frontend.Dockerfile`
- Depends on: backend

### 2. Backend
- Port: 8000
- Built from: `docker/backend.Dockerfile`
- Depends on: weaviate, neo4j
- Environment: Weaviate and Neo4j URLs

### 3. Weaviate
- Port: 8080
- Image: `semitechnologies/weaviate:1.24.1`
- Persistent storage

### 4. Neo4j
- Ports: 7474 (HTTP), 7687 (Bolt)
- Image: `neo4j:5.16.0`
- Default auth: neo4j/password

## Commands Reference

```bash
# Start all services
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (clears data)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f weaviate
docker-compose logs -f neo4j

# Restart a service
docker-compose restart backend

# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend python -c "print('Hello')"
```

## Data Persistence

### Weaviate Data
- Stored in Docker volume: `weaviate_data`
- Persists across container restarts
- To clear: `docker-compose down -v`

### Neo4j Data
- Stored in Docker volume: `neo4j_data`
- Persists across container restarts
- To clear: `docker-compose down -v`

## Next Steps

1. **Start Docker services**: `docker-compose up -d`
2. **Verify connections**: Check `/health` endpoint
3. **Upload documents**: Use the UI to upload PDFs
4. **Query system**: Ask questions and see results
5. **View graph**: Check Neo4j browser at http://localhost:7474

## Migration from In-Memory

If you have existing data in memory, you'll need to re-upload documents after switching to Weaviate/Neo4j. The databases start empty.

## Performance

With Weaviate and Neo4j:
- **Faster searches** on large document collections
- **Better relevance** with vector similarity
- **Complex queries** with graph traversal
- **Persistent data** across restarts

## Support

If you encounter issues:
1. Check Docker is running: `docker ps`
2. Check logs: `docker-compose logs -f`
3. Verify ports are available: `netstat -an | findstr "8080 7687"`
4. Check `.env` configuration
5. Try fallback mode (set `USE_WEAVIATE=false` and `USE_NEO4J=false`)
