#!/bin/bash

# ============================================================================
# DOCKER VALIDATION SCRIPT
# Tests Docker Compose setup and service communication
# ============================================================================

echo "🐳 DOCKER VALIDATION TEST SUITE"
echo "========================================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# ============================================================================
# TEST 15: Docker Compose Services
# ============================================================================

echo ""
echo "TEST 15: Docker Compose Services"
echo "------------------------------------------------------------------------"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ FAIL${NC} | docker-compose.yml not found"
    ((FAILED++))
else
    echo -e "${GREEN}✅ PASS${NC} | docker-compose.yml exists"
    ((PASSED++))
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  WARN${NC} | Docker daemon not running"
    echo "   Please start Docker to run full validation"
else
    echo -e "${GREEN}✅ PASS${NC} | Docker daemon running"
    ((PASSED++))
    
    # Check if services are defined
    echo ""
    echo "Checking service definitions..."
    
    services=("frontend" "backend" "weaviate" "neo4j")
    for service in "${services[@]}"; do
        if docker-compose config | grep -q "$service:"; then
            echo -e "${GREEN}✅${NC} $service service defined"
            ((PASSED++))
        else
            echo -e "${RED}❌${NC} $service service missing"
            ((FAILED++))
        fi
    done
fi

# ============================================================================
# TEST 16: Service Communication
# ============================================================================

echo ""
echo "TEST 16: Service Communication"
echo "------------------------------------------------------------------------"

# Check if services are running
if docker info > /dev/null 2>&1; then
    echo "Checking running services..."
    
    # Check backend
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC} | Backend service accessible (port 8000)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC} | Backend not accessible (may not be running)"
        echo "   Run: docker-compose up -d"
    fi
    
    # Check Weaviate
    if curl -s http://localhost:8080/v1/.well-known/ready > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC} | Weaviate accessible (port 8080)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC} | Weaviate not accessible"
    fi
    
    # Check Neo4j
    if curl -s http://localhost:7474 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC} | Neo4j accessible (port 7474)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC} | Neo4j not accessible"
    fi
    
    # Check Frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC} | Frontend accessible (port 3000)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  WARN${NC} | Frontend not accessible"
    fi
fi

# ============================================================================
# Docker Build Test
# ============================================================================

echo ""
echo "Docker Build Validation"
echo "------------------------------------------------------------------------"

# Check if Dockerfiles exist
if [ -f "docker/backend.Dockerfile" ]; then
    echo -e "${GREEN}✅${NC} Backend Dockerfile exists"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Backend Dockerfile missing"
    ((FAILED++))
fi

if [ -f "docker/frontend.Dockerfile" ]; then
    echo -e "${GREEN}✅${NC} Frontend Dockerfile exists"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Frontend Dockerfile missing"
    ((FAILED++))
fi

# ============================================================================
# Environment Variables
# ============================================================================

echo ""
echo "Environment Configuration"
echo "------------------------------------------------------------------------"

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅${NC} .env.example exists"
    ((PASSED++))
    
    # Check for required variables
    required_vars=("WEAVIATE_URL" "NEO4J_URI" "NEO4J_USER" "NEO4J_PASSWORD")
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.example; then
            echo -e "${GREEN}  ✓${NC} $var defined"
        else
            echo -e "${YELLOW}  ⚠${NC} $var not in .env.example"
        fi
    done
else
    echo -e "${YELLOW}⚠️  WARN${NC} | .env.example not found"
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "========================================================================"
echo "DOCKER VALIDATION SUMMARY"
echo "========================================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL))
    echo "Success Rate: $PERCENTAGE%"
fi

echo "========================================================================"

# Quick start guide
echo ""
echo "📚 Quick Start Guide:"
echo "   1. Start services:    docker-compose up -d"
echo "   2. Check logs:        docker-compose logs -f"
echo "   3. Stop services:     docker-compose down"
echo "   4. Rebuild:           docker-compose up -d --build"
echo ""

# Exit with appropriate code
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
