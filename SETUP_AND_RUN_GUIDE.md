# 🚀 Setup and Run Guide

Complete terminal commands to set up and run the Smart Multi-Modal Education Tutor.

---

## 📋 Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Git installed (optional)

---

## 🔧 Initial Setup (One-Time)

### Step 1: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install Python packages
pip install -r requirements.txt

# Go back to root
cd ..
```

### Step 2: Install Frontend Dependencies

```bash
# Install Node packages
npm install
```

### Step 3: Create Environment File (Optional)

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your API keys (optional for basic functionality)
# notepad .env  (Windows)
# nano .env     (Mac/Linux)
```

---

## ▶️ Running the Application

### Option 1: Run Both Services (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### Option 2: Using PowerShell (Windows)

**Terminal 1 - Backend:**
```powershell
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

---

### Option 3: Background Processes (Advanced)

**Windows PowerShell:**
```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python main.py"

# Start frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

**Mac/Linux:**
```bash
# Start backend in background
cd backend && python main.py &

# Start frontend in background
npm run dev &
```

---

## 🧪 Running Tests

### Backend Tests

```bash
# Navigate to backend
cd backend

# Run all tests
pytest -v

# Run specific test file
pytest test_main.py -v

# Run with coverage
pytest --cov=. --cov-report=html

# Go back to root
cd ..
```

### Frontend Tests

```bash
# Run all frontend tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

### Run All Tests

```bash
# Using the master test runner (Mac/Linux)
bash run_all_tests.sh

# Windows (run each separately)
cd backend
pytest -v
cd ..
npm test
```

---

## 🐳 Docker Setup (Optional)

### Start All Services with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Check Docker Services

```bash
# Check running containers
docker-compose ps

# Check specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs weaviate
docker-compose logs neo4j
```

---

## 🔍 Verification Commands

### Check Backend is Running

```bash
# Health check
curl http://localhost:8000/health

# Or in PowerShell
Invoke-WebRequest http://localhost:8000/health
```

### Check Frontend is Running

```bash
# Open in browser
start http://localhost:3000  # Windows
open http://localhost:3000   # Mac
xdg-open http://localhost:3000  # Linux
```

### Check API Documentation

```bash
# Open Swagger UI
start http://localhost:8000/docs  # Windows
open http://localhost:8000/docs   # Mac
```

---

## 📁 Project Structure Navigation

```bash
# View project structure
tree -L 2  # Mac/Linux
tree /F    # Windows

# Or manually
ls -la     # Mac/Linux
dir        # Windows
```

---

## 🛠️ Development Commands

### Backend Development

```bash
cd backend

# Run with auto-reload
python main.py

# Run specific Python file
python -m app.rag.retrieval

# Install new package
pip install package-name
pip freeze > requirements.txt

# Format code (if black installed)
black .

# Lint code (if pylint installed)
pylint *.py
```

### Frontend Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint TypeScript
npm run lint

# Install new package
npm install package-name
```

---

## 🧹 Cleanup Commands

### Stop Running Processes

**Find and kill processes:**

```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*python*"}
Stop-Process -Name python -Force

Get-Process | Where-Object {$_.ProcessName -like "*node*"}
Stop-Process -Name node -Force

# Mac/Linux
ps aux | grep python
kill -9 <PID>

ps aux | grep node
kill -9 <PID>
```

### Clean Build Artifacts

```bash
# Clean Python cache
find . -type d -name "__pycache__" -exec rm -r {} +  # Mac/Linux
Get-ChildItem -Recurse -Directory __pycache__ | Remove-Item -Recurse -Force  # PowerShell

# Clean Node modules (if needed)
rm -rf node_modules  # Mac/Linux
Remove-Item -Recurse -Force node_modules  # PowerShell

# Reinstall
npm install
```

---

## 📊 Monitoring Commands

### View Backend Logs

```bash
cd backend
python main.py

# Logs will appear in terminal
# Look for:
# - INFO: Uvicorn running on http://0.0.0.0:8000
# - INFO: Application startup complete
```

### View Frontend Logs

```bash
npm run dev

# Logs will appear in terminal
# Look for:
# - VITE ready in XXX ms
# - Local: http://localhost:3000/
```

### Monitor API Requests

```bash
# Backend logs show all requests
# Example output:
# INFO: 127.0.0.1:52150 - "POST /upload HTTP/1.1" 200 OK
# INFO: 127.0.0.1:52150 - "POST /query HTTP/1.1" 200 OK
# INFO: 127.0.0.1:52150 - "GET /graph HTTP/1.1" 200 OK
```

---

## 🔧 Troubleshooting Commands

### Port Already in Use

**Windows:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F

# Find process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Python Module Not Found

```bash
cd backend
pip install -r requirements.txt

# If specific module missing
pip install module-name
```

### Node Module Not Found

```bash
npm install

# If specific module missing
npm install module-name
```

### Permission Denied

**Mac/Linux:**
```bash
# Use sudo if needed
sudo pip install -r requirements.txt
sudo npm install
```

**Windows:**
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → Run as Administrator
```

---

## 📝 Quick Reference

### Start Application (Quick)

```bash
# Terminal 1
cd backend && python main.py

# Terminal 2 (new terminal)
npm run dev
```

### Stop Application

```bash
# In each terminal, press:
Ctrl + C
```

### Restart Application

```bash
# Stop both terminals (Ctrl + C)
# Then start again:

# Terminal 1
cd backend && python main.py

# Terminal 2
npm run dev
```

---

## 🎯 Common Workflows

### Workflow 1: Fresh Start

```bash
# 1. Install dependencies
cd backend && pip install -r requirements.txt && cd ..
npm install

# 2. Start backend
cd backend
python main.py
# (Keep this terminal open)

# 3. Start frontend (new terminal)
npm run dev
# (Keep this terminal open)

# 4. Open browser
# Go to http://localhost:3000
```

### Workflow 2: Run Tests

```bash
# 1. Backend tests
cd backend
pytest -v
cd ..

# 2. Frontend tests
npm test

# 3. View results
```

### Workflow 3: Deploy with Docker

```bash
# 1. Build and start
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. View logs
docker-compose logs -f

# 4. Stop when done
docker-compose down
```

---

## 🌐 URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main UI |
| Backend API | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Health Check | http://localhost:8000/health | Status |
| Weaviate | http://localhost:8080 | Vector DB (if Docker) |
| Neo4j | http://localhost:7474 | Graph DB (if Docker) |

---

## 💡 Pro Tips

### Tip 1: Keep Terminals Organized
```bash
# Use terminal tabs or split panes
# Tab 1: Backend
# Tab 2: Frontend
# Tab 3: Tests/Commands
```

### Tip 2: Use Aliases (Optional)
```bash
# Add to ~/.bashrc or ~/.zshrc (Mac/Linux)
alias start-backend="cd backend && python main.py"
alias start-frontend="npm run dev"
alias run-tests="cd backend && pytest -v && cd .. && npm test"

# Then just run:
start-backend
start-frontend
```

### Tip 3: Auto-Restart on Changes
```bash
# Backend auto-reloads by default (uvicorn --reload)
# Frontend auto-reloads by default (Vite HMR)
# Just save files and see changes!
```

---

## 🆘 Getting Help

### Check Logs
```bash
# Backend logs show in terminal where you ran python main.py
# Frontend logs show in terminal where you ran npm run dev
```

### Check System Status
```bash
# Backend health
curl http://localhost:8000/health

# Check what's running
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :8000
lsof -i :3000
```

### Common Issues

1. **Port in use**: Kill the process or use different port
2. **Module not found**: Run `pip install -r requirements.txt` or `npm install`
3. **Permission denied**: Use sudo (Mac/Linux) or run as Administrator (Windows)
4. **Connection refused**: Make sure backend is running before frontend

---

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000 in browser
- [ ] Can upload files
- [ ] Can ask questions
- [ ] Graph updates automatically
- [ ] Tests pass

---

**Last Updated**: 2026-04-30  
**Status**: ✅ Ready to Run  
**Support**: Check logs and troubleshooting section above
