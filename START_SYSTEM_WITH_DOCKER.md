# Start System with Docker - Step by Step

## Prerequisites Check

### 1. Is Docker Desktop Installed?

Run this command:
```cmd
docker --version
```

**If you see an error**: Docker is not installed
- Download from: https://www.docker.com/products/docker-desktop
- Install and restart your computer
- Come back to this guide

**If you see a version number**: Docker is installed ✅

### 2. Is Docker Desktop Running?

Run this command:
```cmd
docker ps
```

**If you see an error about "pipe/dockerDesktopLinuxEngine"**: Docker Desktop is not running
- **Fix**: Start Docker Desktop (see below)

**If you see a table (even if empty)**: Docker is running ✅

## Starting Docker Desktop

### Method 1: Start Menu (Easiest)
1. Press **Windows key**
2. Type **"Docker Desktop"**
3. Click the Docker Desktop app
4. Wait 30-60 seconds for it to start
5. Look for the whale icon in your system tray (bottom-right)
6. When the whale stops animating, Docker is ready

### Method 2: PowerShell
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Method 3: Use Our Check Script
```cmd
check_docker.bat
```

This will tell you if Docker is running or not.

## Starting the System

Once Docker Desktop is running, you have 3 options:

### Option 1: Full Docker Compose (All Services)

**Start everything:**
```cmd
docker-compose up -d
```

**What this starts:**
- Frontend (port 3000)
- Backend (port 8000)
- Weaviate (port 8080)
- Neo4j (ports 7474, 7687)

**Check status:**
```cmd
docker-compose ps
```

**View logs:**
```cmd
docker-compose logs -f
```

**Stop everything:**
```cmd
docker-compose down
```

### Option 2: Just Databases (Recommended for Development)

**Start databases only:**
```cmd
start_databases.bat
```

**Then start backend manually:**
```cmd
cd backend
pip install weaviate-client==4.4.0 neo4j==5.16.0
python main_with_dbs.py
```

**Then start frontend manually (new terminal):**
```cmd
npm run dev
```

### Option 3: No Docker (In-Memory Mode)

**Just run backend and frontend without databases:**
```cmd
# Backend
cd backend
python main.py

# Frontend (new terminal)
npm run dev
```

This uses in-memory storage (no persistence).

## Verification Steps

### 1. Check Docker is Running
```cmd
docker ps
```

Should show running containers (or empty table if nothing running yet).

### 2. Check Databases (if using Docker)
```cmd
# Check Weaviate
curl http://localhost:8080/v1/.well-known/ready

# Check Neo4j (open in browser)
start http://localhost:7474
```

### 3. Check Backend
```cmd
curl http://localhost:8000/health
```

Should show:
```json
{
  "status": "healthy",
  "weaviate_connected": true,
  "neo4j_connected": true
}
```

### 4. Check Frontend
Open browser: http://localhost:3000

## Troubleshooting

### Error: "pipe/dockerDesktopLinuxEngine"

**Problem**: Docker Desktop is not running

**Solution**:
1. Start Docker Desktop from Start Menu
2. Wait 30-60 seconds
3. Try again

### Error: "Port already in use"

**Problem**: Another service is using the port

**Solution**:
```cmd
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Error: "Cannot connect to Docker daemon"

**Problem**: Docker service is not running

**Solution**:
1. Open Docker Desktop
2. Go to Settings → General
3. Make sure "Start Docker Desktop when you log in" is checked
4. Restart Docker Desktop

### Databases Won't Start

**Check Docker logs:**
```cmd
docker logs weaviate
docker logs neo4j
```

**Restart containers:**
```cmd
docker restart weaviate
docker restart neo4j
```

### Backend Can't Connect to Databases

**Check environment variables:**

Create `backend/.env` file:
```env
WEAVIATE_URL=http://localhost:8080
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
USE_WEAVIATE=true
USE_NEO4J=true
```

## Quick Reference Commands

### Docker Desktop
```cmd
# Check if Docker is running
docker ps

# Check Docker version
docker --version

# Check Docker info
docker info
```

### Docker Compose
```cmd
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Rebuild and start
docker-compose up -d --build
```

### Individual Containers
```cmd
# List running containers
docker ps

# List all containers
docker ps -a

# Stop a container
docker stop weaviate

# Start a container
docker start weaviate

# Remove a container
docker rm weaviate

# View logs
docker logs weaviate
```

### Database Access
```cmd
# Weaviate health check
curl http://localhost:8080/v1/.well-known/ready

# Neo4j browser
start http://localhost:7474
```

## Recommended Workflow

### For Development:
1. Start Docker Desktop
2. Run `start_databases.bat` (just databases)
3. Run backend: `python backend/main_with_dbs.py`
4. Run frontend: `npm run dev`
5. Develop and test
6. Stop databases when done: `docker stop weaviate neo4j`

### For Production/Demo:
1. Start Docker Desktop
2. Run `docker-compose up -d` (everything)
3. Access at http://localhost:3000
4. Stop when done: `docker-compose down`

## System Architecture

```
┌─────────────────────────────────────────┐
│         Docker Desktop                  │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ Weaviate │  │  Neo4j   │           │
│  │  :8080   │  │:7474/7687│           │
│  └──────────┘  └──────────┘           │
│                                         │
└─────────────────────────────────────────┘
           ▲           ▲
           │           │
           └───────────┘
                 │
         ┌───────────────┐
         │   Backend     │
         │    :8000      │
         └───────────────┘
                 ▲
                 │
         ┌───────────────┐
         │   Frontend    │
         │    :3000      │
         └───────────────┘
```

## Next Steps

1. **Start Docker Desktop** (if not running)
2. **Run check script**: `check_docker.bat`
3. **Choose your option**:
   - Full Docker: `docker-compose up -d`
   - Just databases: `start_databases.bat`
   - No Docker: Use `python backend/main.py`
4. **Verify everything works**
5. **Start using the system**

## Support

If you're still having issues:
1. Make sure Docker Desktop is installed
2. Make sure Docker Desktop is running (whale icon in system tray)
3. Check `docker ps` works without errors
4. Try restarting Docker Desktop
5. Try restarting your computer
6. Check Windows Firewall isn't blocking Docker

## Summary

✅ **Docker Desktop must be running** before using docker-compose
✅ **Use `check_docker.bat`** to verify Docker status
✅ **Use `start_databases.bat`** for easy database startup
✅ **Use `docker-compose up -d`** for full system
✅ **Fallback to in-memory** if Docker issues persist
