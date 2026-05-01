@echo off
echo ==========================================
echo   Multi-Modal RAG System - Docker Setup
echo ==========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo Docker is running
echo.

REM Check if Ollama is running
echo Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo WARNING: Ollama is not running on localhost:11434
    echo The system will work but LLM features will be limited
    echo To start Ollama: ollama serve
) else (
    echo Ollama is running
)
echo.

REM Stop existing containers
echo Stopping existing containers...
docker-compose down
echo.

REM Build images
echo Building Docker images...
echo This may take 10-15 minutes on first run to download models
docker-compose build --no-cache backend
echo.

REM Start services
echo Starting services...
docker-compose up -d
echo.

REM Wait for services
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check backend health
echo Checking backend health...
:healthcheck
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo   Waiting...
    timeout /t 2 /nobreak >nul
    goto healthcheck
)

echo Backend is ready!
echo.

echo ==========================================
echo   System Status
echo ==========================================
echo.

docker-compose ps

echo.
echo ==========================================
echo   Access Points
echo ==========================================
echo.
echo Backend API:    http://localhost:8000
echo API Docs:       http://localhost:8000/docs
echo Health Check:   http://localhost:8000/health
echo Weaviate:       http://localhost:8080
echo Neo4j Browser:  http://localhost:7474
echo.
echo ==========================================
echo   Quick Test
echo ==========================================
echo.
echo curl http://localhost:8000/health
echo.
echo ==========================================
echo   View Logs
echo ==========================================
echo.
echo docker-compose logs -f backend
echo.
echo ==========================================
echo   Stop System
echo ==========================================
echo.
echo docker-compose down
echo.
pause
