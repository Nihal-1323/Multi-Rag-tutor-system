#!/bin/bash

echo "=========================================="
echo "  Multi-Modal RAG System - Docker Setup"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if Ollama is running
echo "Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "⚠️  Warning: Ollama is not running on localhost:11434"
    echo "   The system will work but LLM features will be limited"
    echo "   To start Ollama: ollama serve"
fi
echo ""

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down
echo ""

# Build images
echo "Building Docker images..."
echo "(This may take 10-15 minutes on first run to download models)"
docker-compose build --no-cache backend
echo ""

# Start services
echo "Starting services..."
docker-compose up -d
echo ""

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Check backend health
echo "Checking backend health..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    echo "  Waiting... ($i/30)"
    sleep 2
done

echo ""
echo "=========================================="
echo "  System Status"
echo "=========================================="
echo ""

# Show service status
docker-compose ps

echo ""
echo "=========================================="
echo "  Access Points"
echo "=========================================="
echo ""
echo "🌐 Backend API:    http://localhost:8000"
echo "📊 API Docs:       http://localhost:8000/docs"
echo "🔍 Health Check:   http://localhost:8000/health"
echo "📈 Weaviate:       http://localhost:8080"
echo "🗄️  Neo4j Browser:  http://localhost:7474"
echo ""
echo "=========================================="
echo "  Quick Test"
echo "=========================================="
echo ""
echo "curl http://localhost:8000/health"
echo ""
echo "=========================================="
echo "  View Logs"
echo "=========================================="
echo ""
echo "docker-compose logs -f backend"
echo ""
echo "=========================================="
echo "  Stop System"
echo "=========================================="
echo ""
echo "docker-compose down"
echo ""
