#!/bin/bash

echo "🚀 Starting Weaviate and Neo4j..."
echo "========================================"

# Start Weaviate
echo "Starting Weaviate on port 8080..."
docker run -d \
  --name weaviate \
  -p 8080:8080 \
  -e QUERY_DEFAULTS_LIMIT=25 \
  -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
  -e PERSISTENCE_DATA_PATH=/var/lib/weaviate \
  -e DEFAULT_VECTORIZER_MODULE=none \
  -e ENABLE_MODULES= \
  semitechnologies/weaviate:1.24.1

# Start Neo4j
echo "Starting Neo4j on ports 7474 and 7687..."
docker run -d \
  --name neo4j \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5.16.0

echo ""
echo "✅ Databases started!"
echo "========================================"
echo "Weaviate: http://localhost:8080"
echo "Neo4j Browser: http://localhost:7474"
echo "  Username: neo4j"
echo "  Password: password"
echo ""
echo "To check status: docker ps"
echo "To stop: docker stop weaviate neo4j"
echo "To remove: docker rm weaviate neo4j"
