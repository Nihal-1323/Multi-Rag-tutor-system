# 🤖 Ollama LLM Integration Guide

## Why Ollama?

Ollama allows you to run powerful LLMs **locally** on your machine:
- ✅ **Free** - No API costs
- ✅ **Private** - Data stays on your machine
- ✅ **Fast** - Local inference
- ✅ **Easy** - Simple setup

---

## 🚀 Quick Setup

### Step 1: Install Ollama

**Windows:**
```powershell
# Download from: https://ollama.ai/download
# Run the installer
```

**Mac:**
```bash
curl https://ollama.ai/install.sh | sh
```

**Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

### Step 2: Pull a Model

```bash
# Recommended models (choose one):

# Llama 2 (7B) - Good balance
ollama pull llama2

# Mistral (7B) - Fast and accurate
ollama pull mistral

# Phi-2 (2.7B) - Lightweight, fast
ollama pull phi

# CodeLlama (7B) - Good for technical content
ollama pull codellama
```

### Step 3: Verify Installation

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Test a model
ollama run llama2 "Hello, how are you?"
```

### Step 4: Configure Your App

Create or edit `.env` file:
```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Step 5: Restart Backend

```bash
cd backend
python main.py
```

---

## 📊 Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **llama2** | 7B | Medium | High | General purpose |
| **mistral** | 7B | Fast | High | Balanced performance |
| **phi** | 2.7B | Very Fast | Good | Quick responses |
| **codellama** | 7B | Medium | High | Technical/code content |
| **neural-chat** | 7B | Fast | High | Conversational |

---

## 🎯 How It Works

### Without LLM (Current Fallback):
```
Query: "What is database?"
↓
Search documents
↓
Extract snippet: "...Jenkins is an open-source automation..."
↓
Return raw snippet (incomplete, out of context)
```

### With LLM (Ollama):
```
Query: "What is database?"
↓
Search documents
↓
Extract relevant snippets
↓
Send to LLM with prompt:
  "Based on this context: [snippets]
   Answer the question: What is database?"
↓
LLM generates coherent answer:
  "Based on the provided documents, while they primarily 
   discuss Jenkins and CI/CD, they don't contain specific 
   information about databases. However, databases are 
   typically used in DevOps pipelines for..."
↓
Return complete, contextual answer
```

---

## 🔧 Advanced Configuration

### Custom Model Settings

Edit `backend/main.py`:

```python
# In generate_with_ollama function
response = requests.post(
    f"{OLLAMA_URL}/api/generate",
    json={
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,    # Creativity (0.0-1.0)
            "top_p": 0.9,          # Diversity (0.0-1.0)
            "max_tokens": 500,     # Response length
            "num_ctx": 2048        # Context window
        }
    }
)
```

### Temperature Guide:
- **0.0-0.3**: Factual, deterministic (good for technical Q&A)
- **0.4-0.7**: Balanced (recommended)
- **0.8-1.0**: Creative, varied

---

## 🧪 Testing LLM Integration

### Test 1: Check Ollama Status

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "documents": 1,
  "llm_available": true,
  "llm_model": "llama2"
}
```

### Test 2: Query with LLM

```bash
# Upload a document first
curl -X POST http://localhost:8000/upload \
  -F "file=@document.pdf"

# Query
curl -X POST "http://localhost:8000/query?query=what%20is%20devops&session_id=test"
```

**With LLM**: Complete, coherent answer  
**Without LLM**: Raw snippets

---

## 📈 Performance Comparison

### Without LLM:
```
Response: "...Jenkins is an open-source automation server..."
Quality: ⭐⭐ (incomplete, fragmented)
Speed: ⚡⚡⚡ (instant)
```

### With LLM (Llama2):
```
Response: "DevOps is a methodology that combines software 
development and IT operations. Based on your document, it 
involves continuous integration using tools like Jenkins..."
Quality: ⭐⭐⭐⭐⭐ (complete, coherent)
Speed: ⚡⚡ (2-5 seconds)
```

---

## 🎨 Example Outputs

### Query: "What is DevOps?"

**Without LLM:**
```
From UNIT 3.pdf:
...DEVOTION TO ENLIGHTENMENT DEVOTION TO ENLIGHTENMENT 
Devops[Development and Operations]: CIAEC59 Unit-3...
```

**With LLM:**
```
DevOps is a methodology that combines software development 
(Dev) and IT operations (Ops) to improve collaboration and 
productivity. Based on your uploaded document (UNIT 3.pdf), 
DevOps involves:

1. Continuous Integration (CI) - Automating code integration
2. Continuous Deployment (CD) - Automating deployment
3. Tools like Jenkins for pipeline automation
4. Practices that shorten development lifecycle

The document specifically covers Jenkins as a key DevOps tool 
for automating building, testing, and deployment processes.

Sources:
1. UNIT 3.pdf (relevance: 0.95)
```

---

## 🔍 Troubleshooting

### Issue 1: "Ollama not available"

**Solution:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start Ollama
ollama serve

# Or restart Ollama service
# Windows: Restart from system tray
# Mac/Linux: sudo systemctl restart ollama
```

### Issue 2: "Model not found"

**Solution:**
```bash
# Pull the model
ollama pull llama2

# List available models
ollama list

# Update .env with correct model name
OLLAMA_MODEL=llama2
```

### Issue 3: Slow responses

**Solutions:**
1. Use smaller model: `ollama pull phi`
2. Reduce max_tokens: `"max_tokens": 300`
3. Use GPU if available
4. Close other applications

### Issue 4: Out of memory

**Solutions:**
1. Use smaller model (phi instead of llama2)
2. Reduce context window: `"num_ctx": 1024`
3. Close other applications
4. Upgrade RAM

---

## 💡 Pro Tips

### Tip 1: Model Selection
```bash
# For quick responses (2-3 sec)
ollama pull phi

# For best quality (5-10 sec)
ollama pull llama2

# For technical content
ollama pull codellama
```

### Tip 2: Prompt Engineering

The system uses this prompt structure:
```
You are a helpful AI assistant. Answer the question based 
ONLY on the provided context. If the context doesn't contain 
enough information, say so.

Context: [retrieved snippets]
Question: [user query]
Answer:
```

You can customize this in `backend/main.py`!

### Tip 3: Hybrid Mode

The system automatically falls back to snippets if Ollama is unavailable:
- ✅ LLM available → Coherent answers
- ✅ LLM unavailable → Raw snippets (still works!)

---

## 🚀 Next Steps

### Phase 1: Basic LLM (Current)
- [x] Ollama integration
- [x] Prompt engineering
- [x] Fallback mechanism
- [x] Health check

### Phase 2: Advanced Features
- [ ] Streaming responses
- [ ] Multi-turn conversations
- [ ] Context memory
- [ ] Custom prompts per query type

### Phase 3: Production
- [ ] Response caching
- [ ] Load balancing
- [ ] Model switching
- [ ] Performance monitoring

---

## 📊 System Architecture

```
User Query
    ↓
Document Search (Vector + Keyword)
    ↓
Top 3 Results Retrieved
    ↓
Context Preparation
    ↓
Ollama LLM Generation
    ↓
Coherent Answer + Sources
    ↓
User
```

---

## ✅ Quick Checklist

- [ ] Ollama installed
- [ ] Model pulled (llama2/mistral/phi)
- [ ] Ollama running (port 11434)
- [ ] .env configured
- [ ] Backend restarted
- [ ] Health check shows llm_available: true
- [ ] Test query returns coherent answer

---

## 🆘 Getting Help

### Check Status:
```bash
# Ollama status
curl http://localhost:11434/api/tags

# App status
curl http://localhost:8000/health

# Test model
ollama run llama2 "test"
```

### Common Commands:
```bash
# List models
ollama list

# Remove model
ollama rm llama2

# Update model
ollama pull llama2

# Stop Ollama
# Windows: System tray → Quit
# Mac/Linux: killall ollama
```

---

**Status**: ✅ Ready to Integrate  
**Recommended Model**: llama2 or mistral  
**Setup Time**: 5-10 minutes  
**Result**: Complete, coherent answers!
