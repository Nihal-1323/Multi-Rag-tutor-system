# Quick Fix: Docker Not Running

## The Error You're Seeing

```
unable to get image 'semitechnologies/weaviate:1.24.1': 
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

## What This Means

**Docker Desktop is not running on your computer.**

## Quick Fix (3 Steps)

### Step 1: Start Docker Desktop

**Press Windows Key → Type "Docker Desktop" → Click it**

![Docker Desktop Icon]

### Step 2: Wait for Docker to Start

Look for the **whale icon** in your system tray (bottom-right corner).

When the whale **stops animating**, Docker is ready (30-60 seconds).

### Step 3: Try Again

```cmd
docker ps
```

If you see a table (even empty), Docker is running! ✅

Now you can run:
```cmd
docker-compose up -d
```

## Alternative: Use Our Check Script

```cmd
check_docker.bat
```

This will tell you exactly what's wrong.

## Still Not Working?

### Option 1: Install Docker Desktop

If you don't have Docker Desktop installed:
1. Go to: https://www.docker.com/products/docker-desktop
2. Download Docker Desktop for Windows
3. Install it
4. Restart your computer
5. Start Docker Desktop
6. Come back and try again

### Option 2: Use Without Docker

You can run the system without Docker (in-memory mode):

```cmd
# Backend
cd backend
python main.py

# Frontend (new terminal)
npm run dev
```

This works but **data won't persist** across restarts.

### Option 3: Just Start Databases

Once Docker Desktop is running:

```cmd
start_databases.bat
```

Then run backend and frontend manually:
```cmd
# Backend
cd backend
pip install weaviate-client neo4j
python main_with_dbs.py

# Frontend
npm run dev
```

## How to Know Docker is Running

### ✅ Docker is Running:
```cmd
PS C:\TF\TE-main> docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```
(Empty table is fine - means no containers running yet)

### ❌ Docker is NOT Running:
```cmd
PS C:\TF\TE-main> docker ps
error during connect: ... pipe/dockerDesktopLinuxEngine ...
```

## Summary

1. **Start Docker Desktop** from Start Menu
2. **Wait 30-60 seconds** for it to start
3. **Check with**: `docker ps`
4. **Then run**: `docker-compose up -d` or `start_databases.bat`

That's it! 🚀
