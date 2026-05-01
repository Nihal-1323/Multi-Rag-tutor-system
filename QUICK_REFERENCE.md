# 🚀 QUICK REFERENCE CARD

## One-Command Test Execution

```bash
# Run EVERYTHING
bash run_all_tests.sh
```

---

## Individual Test Suites

```bash
# Backend unit tests (8 tests)
cd backend && pytest test_main.py -v

# Rubric validation (16 tests)
cd backend && pytest test_rubric_validation.py -v

# Metrics validation (6 tests)
cd backend && pytest test_metrics.py -v -s

# Frontend tests (28 tests)
npm test

# Docker validation
bash test_docker.sh
```

---

## Service Management

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Upload file
curl -X POST http://localhost:8000/upload \
  -F "file=@test.txt"

# Query
curl -X POST "http://localhost:8000/query?query=test&session_id=test"

# Get graph
curl http://localhost:8000/graph
```

---

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | UI |
| Backend | http://localhost:8000 | API |
| Weaviate | http://localhost:8080 | Vector DB |
| Neo4j | http://localhost:7474 | Graph DB |

---

## Test File Locations

```
backend/
├── test_main.py                 # Unit tests
├── test_rubric_validation.py    # Rubric tests
└── test_metrics.py              # Metrics tests

src/components/
├── GraphView.test.tsx           # Graph tests
├── UploadManager.test.tsx       # Upload tests
└── ChatInterface.test.tsx       # Chat tests
```

---

## Expected Test Results

```
✅ Backend Unit:        8/8 passing
✅ Rubric Validation:  16/16 passing
✅ Metrics:             6/6 passing
✅ Frontend:           28/28 passing
✅ Docker:              2/2 passing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TOTAL:              60/60 passing
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend not running | `cd backend && python main.py` |
| Docker not running | `docker-compose up -d` |
| Port conflict | Check ports: 3000, 8000, 8080, 7474, 7687 |
| Import error | `pip install -r backend/requirements.txt` |
| Test failure | Run with `-v -s` for details |

---

## Key Metrics Targets

| Metric | Target | Test |
|--------|--------|------|
| Precision@K | ≥ 0.6 | `test_precision_at_k` |
| Recall@K | ≥ 0.7 | `test_recall_at_k` |
| BERTScore | ≥ 0.85 | `test_bertscore` |
| Latency | < 3s | `test_query_latency` |

---

## Demo Flow

1. **Start services** (30s)
   ```bash
   docker-compose up -d
   ```

2. **Run tests** (2 min)
   ```bash
   bash run_all_tests.sh
   ```

3. **Upload files** (1 min)
   - Text: neural_networks.txt
   - Image: diagram.png
   - Audio: lecture.mp3

4. **Query examples** (2 min)
   - "What is gradient descent?"
   - "Explain with diagram"
   - "Summarize lecture"

5. **Show metrics** (1 min)
   - Precision/Recall
   - Latency
   - Multi-modal impact

---

## Documentation Files

| File | Purpose |
|------|---------|
| `RUBRIC_TEST_SUMMARY.md` | Complete overview |
| `TEST_RUBRIC_GUIDE.md` | Detailed test docs |
| `FINAL_CHECKLIST.md` | Submission checklist |
| `TESTING.md` | Original test docs |
| `README.md` | Project overview |

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
```

---

## Environment Setup

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
npm install

# Environment variables
cp .env.example .env
# Edit .env with your values
```

---

## Quick Verification

```bash
# 1. Services running?
curl http://localhost:8000/health

# 2. Tests passing?
cd backend && pytest test_main.py -v

# 3. Frontend working?
npm test

# 4. Docker working?
docker-compose ps
```

---

## Submission Package

```
✅ Code (backend/ + src/)
✅ Tests (all test files)
✅ Documentation (all .md files)
✅ Docker (docker-compose.yml + Dockerfiles)
✅ Demo (video + screenshots)
✅ Git workflow (PR screenshots)
```

---

## Emergency Commands

```bash
# Clean everything
docker-compose down -v
rm -rf node_modules backend/__pycache__

# Fresh install
npm install
pip install -r backend/requirements.txt

# Restart everything
docker-compose up -d --build
python backend/main.py
npm run dev
```

---

## Contact & Support

- Check `TROUBLESHOOTING` section in docs
- Review test output with `-v -s` flags
- Check service logs: `docker-compose logs -f`
- Verify all dependencies installed

---

**Last Updated**: 2026-04-30  
**Version**: 1.0  
**Status**: ✅ Production Ready
