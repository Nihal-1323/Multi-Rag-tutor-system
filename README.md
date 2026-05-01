# Smart Multi-Modal Education Tutor with Graph-Based RAG

🎓 **A production-ready Multi-Modal RAG system with Knowledge Graph integration.**

---

## 🎯 Objective
Build a sophisticated tutoring system that uses hybrid retrieval (Vector + Graph) to provide grounded, explainable answers from text, images, and audio.

## 🏗️ Architecture

```text
User Query (Text/Image/Audio)
│
├──► Embedding Layer (CLIP, Whisper, SentenceTransformers)
│
├──► Hybrid Retrieval
│    ├── Vector Search (Weaviate) ───┐
│    └── Graph Traversal (Neo4j) ────┴──► Merged Context
│
├──► Reranking (Cross-Encoder)
│
├──► LLM Generation (Gemini Pro / Pro Vision)
│
└──► Response (Answer + Explanation + Graph Visual)
```

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, React Force Graph.
- **Backend:** FastAPI (Python), PyMuPDF, Whisper, CLIP.
- **Databases:** Weaviate (Vector), Neo4j (Graph).
- **Reranker:** Sentence-Transformers Cross-Encoder.
- **Orchestration:** Docker Compose.

---

## 📂 Project Structure

```text
/backend          # FastAPI backend services
/frontend         # React frontend application
/docker           # Dockerfiles and orchestration
/data             # Raw data storage (PDFs, images, audio)
/models           # Local weights/scripts for embeddings
/graph            # Neo4j schema and cypher scripts
/rag              # Core RAG retrieval & reranking logic
```

---

## 🔄 Data Flow

1. **Ingestion:**
   - Text → Chunked & Embedded into Weaviate.
   - Images → CLIP embedded & OCRed.
   - Audio → Whisper transcribed & indexed.
   - Graph → Relationships (e.g., Topic A *leads to* Topic B) stored in Neo4j.

2. **Query:**
   - Multi-modal query embedded.
   - Top-K retrieval from Weaviate.
   - Relevant sub-graph extracted from Neo4j.
   - Cross-Encoder reranks context for relevance.
   - Final prompt constructed with sources.

---

## 🚀 Setup Instructions

### Local Environment (without Docker)
1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
2. **Frontend:**
   ```bash
   npm install
   npm run dev
   ```

### Docker (Recommended)
```bash
docker-compose up --build
```

---

## 📈 Evaluation Metrics

- **Retrieval:** Precision@K, Recall@K.
- **Answer Quality:** Exact Match (EM), F1 Score, BERTScore.
- **Performance:** Latency (ms).

---

## 🧪 Version Control Strategy

The project follows a structured Git workflow to ensure code quality, collaboration, and traceability.

### Branching Strategy

* `main` → stable production-ready code
* `dev` → integration branch for features
* `feature/*` → new features (e.g., `feature/multimodal-retrieval`)
* `bugfix/*` → bug fixes
* `hotfix/*` → urgent fixes on production

### Pull Requests (PRs) — MANDATORY

* All changes must go through **Pull Requests (PRs)** before merging into `dev` or `main`
* Each PR must include:
  * Clear title and description
  * Linked feature or issue
  * Summary of changes
* PR review required before merge.

### Commit Guidelines

* Use meaningful commit messages:
  * `feat: add CLIP image embedding pipeline`
  * `fix: resolve Neo4j query bug`
  * `refactor: optimize retrieval pipeline`

---

## 📚 Literature Survey

- **RAG:** Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks".
- **GraphRAG:** Emerging techniques for structured knowledge injection.
- **CLIP:** Radford et al., "Learning Transferable Visual Models From Natural Language Supervision".
- **Whisper:** OpenAI's robust audio transcription model.
- **Cross-Encoders:** Re-ranking strategies for improved retrieval precision.
