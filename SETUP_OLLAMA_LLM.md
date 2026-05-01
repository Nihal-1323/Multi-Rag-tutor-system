# Setup Ollama LLM for Better Answers

## Current Issue

Your system is working but **LLM is not available**:
```json
{
  "llm_available": false,
  "llm_model": "none"
}
```

This means:
- ❌ Answers are raw text snippets (not coherent)
- ❌ No natural language generation
- ❌ Responses look fragmented

## Solution: Install Ollama

Ollama is a **free, local LLM** that runs on your computer. No API keys needed!

### Step 1: Install Ollama

**Download and Install:**
1. Go to: https://ollama.com/download
2. Click "Download for Windows"
3. Run the installer
4. Follow the installation wizard

**Or use our script:**
```cmd
setup_ollama.bat
```

### Step 2: Start Ollama

Ollama should start automatically after installation. If not:

```cmd
ollama serve
```

Keep this terminal open (Ollama runs in the background).

### Step 3: Download a Model

**Download llama2 (recommended, 4GB):**
```cmd
ollama pull llama2
```

**Or download a smaller model (phi, 1.6GB):**
```cmd
ollama pull phi
```

**Or download mistral (4GB):**
```cmd
ollama pull mistral
```

### Step 4: Verify Ollama is Running

**Check if Ollama is running:**
```cmd
curl http://localhost:11434/api/tags
```

Should return a list of installed models.

**Test Ollama:**
```cmd
ollama run llama2 "Hello, how are you?"
```

Should generate a response.

### Step 5: Restart Your Backend

**If using Docker:**
```cmd
docker-compose restart backend
```

**If running manually:**
```cmd
# Stop the backend (Ctrl+C)
# Then restart:
cd backend
python main.py
```

### Step 6: Verify LLM is Working

**Check health endpoint:**
```cmd
curl http://localhost:8000/health
```

Should now show:
```json
{
  "llm_available": true,
  "llm_model": "llama2"
}
```

## Quick Setup (All-in-One)

Run our setup script:
```cmd
setup_ollama.bat
```

This will:
1. Check if Ollama is installed
2. Start Ollama if not running
3. Download llama2 model
4. Verify everything works

## Configuration

### Change LLM Model

Create `backend/.env` file:
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

Available models:
- `llama2` - Good balance (4GB)
- `phi` - Smaller, faster (1.6GB)
- `mistral` - Better quality (4GB)
- `llama3` - Latest (4.7GB)

### Use Different Port

If Ollama runs on a different port:
```env
OLLAMA_URL=http://localhost:11435
```

## Testing Ollama

### Test from Command Line

```cmd
ollama run llama2 "Explain what is DevOps in simple terms"
```

### Test from Backend

1. Upload a document
2. Ask a question
3. Check the response - should be coherent and well-formatted

### Compare Before/After

**Before Ollama (Raw Snippets):**
```
From UNIT 3.pdf:

...DevOps is a set of practices that combines software 
development (Dev) and IT operations (Ops). It aims to 
shorten the systems development life cycle...

Retrieved using hybrid RAG: vector similarity search
```

**After Ollama (Coherent Answer):**
```
DevOps is a methodology that brings together software 
development and IT operations teams to work collaboratively 
throughout the entire software development lifecycle. 

The main goals of DevOps are to:
1. Increase deployment frequency
2. Achieve faster time to market
3. Lower failure rate of new releases
4. Shorten lead time between fixes

By automating processes and fostering better communication 
between teams, DevOps helps organizations deliver software 
more quickly and reliably.

---
Sources:
1. UNIT 3.pdf (relevance: 0.95)

Generated using RAG: Retrieved context + LLM synthesis
```

## Troubleshooting

### Ollama Not Found

**Error:** `'ollama' is not recognized`

**Solution:**
1. Install Ollama from https://ollama.com/download
2. Restart your terminal
3. Try again

### Ollama Not Running

**Error:** `Connection refused to localhost:11434`

**Solution:**
```cmd
ollama serve
```

Keep this terminal open.

### Model Not Downloaded

**Error:** `model 'llama2' not found`

**Solution:**
```cmd
ollama pull llama2
```

Wait for download to complete (4GB).

### Backend Still Shows LLM Unavailable

**Solution:**
1. Make sure Ollama is running: `curl http://localhost:11434/api/tags`
2. Restart backend: `docker-compose restart backend`
3. Check health: `curl http://localhost:8000/health`

### Slow Responses

**If LLM is too slow:**

1. **Use a smaller model:**
   ```cmd
   ollama pull phi
   ```
   
2. **Update backend/.env:**
   ```env
   OLLAMA_MODEL=phi
   ```

3. **Restart backend**

## System Requirements

### Minimum:
- **RAM**: 8GB
- **Disk**: 5GB free space
- **CPU**: Modern processor (2015+)

### Recommended:
- **RAM**: 16GB
- **Disk**: 10GB free space
- **GPU**: NVIDIA GPU (optional, for faster inference)

## Ollama Commands Reference

```cmd
# Start Ollama
ollama serve

# List installed models
ollama list

# Download a model
ollama pull llama2

# Run a model interactively
ollama run llama2

# Remove a model
ollama rm llama2

# Check version
ollama --version

# Get help
ollama --help
```

## Alternative: Use Without LLM

If you don't want to install Ollama, the system still works:
- ✅ Document upload works
- ✅ Search works
- ✅ Ranking/reranking works
- ✅ Knowledge graph works
- ⚠️ Answers are raw snippets (not coherent)

The system automatically falls back to snippet-based answers.

## Summary

**To get better, coherent answers:**

1. **Install Ollama**: https://ollama.com/download
2. **Download model**: `ollama pull llama2`
3. **Start Ollama**: `ollama serve`
4. **Restart backend**: `docker-compose restart backend`
5. **Verify**: `curl http://localhost:8000/health`

**Or use our script:**
```cmd
setup_ollama.bat
```

Then your answers will be much better! 🚀
