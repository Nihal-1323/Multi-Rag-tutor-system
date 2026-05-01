# 🧪 RUBRIC-ALIGNED TEST SUITE GUIDE

This document maps every test to specific assignment requirements and grading rubric criteria.

## 📋 Test Coverage Overview

| Category | Tests | Status | Rubric Weight |
|----------|-------|--------|---------------|
| Multi-Modal Ingestion | 3 | ✅ | 20% |
| Vector Database | 1 | ✅ | 15% |
| Knowledge Graph | 1 | ✅ | 15% |
| Hybrid Retrieval | 1 | ✅ | 20% |
| Reranker | 1 | ✅ | 10% |
| LLM Output | 2 | ✅ | 10% |
| Metrics | 6 | ✅ | 5% |
| Docker | 2 | ✅ | 3% |
| API | 3 | ✅ | 2% |
| **TOTAL** | **20** | **✅** | **100%** |

---

## 🎯 Test Suite Breakdown

### 1. MULTI-MODAL INGESTION (20 points)

#### TEST 1: Text Ingestion
**File**: `test_rubric_validation.py::TestMultiModalIngestion::test_01_text_ingestion`

**Validates**:
- PDF/text file upload
- Text parsing and chunking
- Embedding generation
- Storage in Weaviate

**Pass Criteria**:
- ✅ File uploads successfully
- ✅ Returns processing status
- ✅ Text embeddings created

**Rubric Mapping**: "Multi-modal ingestion pipeline handles text documents"

---

#### TEST 2: Image Ingestion
**File**: `test_rubric_validation.py::TestMultiModalIngestion::test_02_image_ingestion`

**Validates**:
- Image file upload
- CLIP embedding generation
- Image metadata extraction
- Storage in Weaviate

**Pass Criteria**:
- ✅ Image uploads successfully
- ✅ CLIP processes image
- ✅ Image embeddings created

**Rubric Mapping**: "System processes images using CLIP"

---

#### TEST 3: Audio Ingestion
**File**: `test_rubric_validation.py::TestMultiModalIngestion::test_03_audio_ingestion`

**Validates**:
- Audio file upload
- Whisper transcription
- Audio-to-text conversion
- Transcript embedding

**Pass Criteria**:
- ✅ Audio uploads successfully
- ✅ Whisper transcribes audio
- ✅ Transcript stored

**Rubric Mapping**: "System transcribes audio using Whisper"

---

### 2. VECTOR DATABASE - WEAVIATE (15 points)

#### TEST 4: Multi-Modal Vector Search
**File**: `test_rubric_validation.py::TestVectorDatabase::test_04_vector_search_multimodal`

**Validates**:
- Vector similarity search
- Multi-modal retrieval
- Top-K results
- Relevance scoring

**Pass Criteria**:
- ✅ Query returns results
- ✅ Results from multiple modalities
- ✅ Relevance scores present

**Rubric Mapping**: "Weaviate retrieves relevant documents from all modalities"

---

### 3. KNOWLEDGE GRAPH - NEO4J (15 points)

#### TEST 5: Graph Relationships
**File**: `test_rubric_validation.py::TestKnowledgeGraph::test_05_graph_relationships`

**Validates**:
- Neo4j connection
- Concept relationships
- Graph traversal
- Relationship types

**Pass Criteria**:
- ✅ Graph has ≥2 nodes
- ✅ Graph has ≥1 relationship
- ✅ Relationships are meaningful

**Rubric Mapping**: "Neo4j stores and retrieves concept relationships"

---

### 4. HYBRID RETRIEVAL (20 points)

#### TEST 6: Hybrid Integration
**File**: `test_rubric_validation.py::TestHybridRetrieval::test_06_hybrid_retrieval_integration`

**Validates**:
- Vector + Graph fusion
- Context merging
- Unified response
- Source attribution

**Pass Criteria**:
- ✅ Answer includes vector context
- ✅ Answer includes graph context
- ✅ Sources from both systems
- ✅ Proper attribution

**Rubric Mapping**: "System combines vector and graph retrieval"

---

### 5. RERANKER (10 points)

#### TEST 7: Cross-Encoder Reranking
**File**: `test_rubric_validation.py::TestReranker::test_07_reranker_improves_results`

**Validates**:
- Cross-encoder model loaded
- Reranking applied
- Score improvement
- Result reordering

**Pass Criteria**:
- ✅ Reranker processes results
- ✅ Scores calculated
- ✅ Results reordered by relevance

**Rubric Mapping**: "Cross-encoder reranks retrieved documents"

---

### 6. LLM OUTPUT QUALITY (10 points)

#### TEST 8: Grounded Answers
**File**: `test_rubric_validation.py::TestLLMOutput::test_08_llm_grounded_answer`

**Validates**:
- LLM generates answer
- Answer uses retrieved context
- Answer is coherent
- Sources cited

**Pass Criteria**:
- ✅ Answer length > 50 chars
- ✅ Answer mentions query concepts
- ✅ Sources provided

**Rubric Mapping**: "LLM generates grounded answers with citations"

---

#### TEST 9: Context References
**File**: `test_rubric_validation.py::TestLLMOutput::test_09_llm_references_context`

**Validates**:
- Answer references context
- Explanation provided
- Reasoning visible

**Pass Criteria**:
- ✅ Answer includes explanation
- ✅ Context usage evident

**Rubric Mapping**: "LLM output shows reasoning process"

---

### 7. METRICS VALIDATION (5 points)

#### TEST 9: Precision@K
**File**: `test_metrics.py::TestRetrievalMetrics::test_precision_at_k`

**Formula**: `Precision@K = (# relevant in top K) / K`

**Pass Criteria**: ≥ 0.6 for small dataset

**Rubric Mapping**: "Retrieval precision measured"

---

#### TEST 10: Recall@K
**File**: `test_metrics.py::TestRetrievalMetrics::test_recall_at_k`

**Formula**: `Recall@K = (# relevant in top K) / (total relevant)`

**Pass Criteria**: ≥ 0.7 for small dataset

**Rubric Mapping**: "Retrieval recall measured"

---

#### TEST 11: F1 Score
**File**: `test_metrics.py::TestRetrievalMetrics::test_f1_score`

**Formula**: `F1 = 2 * (P * R) / (P + R)`

**Pass Criteria**: Calculated correctly

**Rubric Mapping**: "F1 score computed"

---

#### TEST 12: BERTScore
**File**: `test_metrics.py::TestSemanticMetrics::test_bertscore`

**Validates**: Semantic similarity between generated and reference answers

**Pass Criteria**: ≥ 0.85 for good match

**Rubric Mapping**: "Semantic quality measured"

---

#### TEST 13: Latency
**File**: `test_metrics.py::TestPerformanceMetrics::test_query_latency`

**Validates**: System response time

**Pass Criteria**: < 3 seconds (GPU) or < 5 seconds (CPU)

**Rubric Mapping**: "Performance metrics collected"

---

#### TEST 14: Multi-Modal Impact
**File**: `test_metrics.py::TestMultimodalImpact::test_multimodal_vs_text_only`

**Validates**: Multi-modal retrieval improves results

**Pass Criteria**: Multi-modal ≥ text-only performance

**Rubric Mapping**: "Multi-modal advantage demonstrated"

---

### 8. DOCKER DEPLOYMENT (3 points)

#### TEST 15: Service Boot
**File**: `test_docker.sh`

**Validates**:
- docker-compose.yml valid
- All services defined
- Services start successfully

**Pass Criteria**:
- ✅ Frontend running
- ✅ Backend running
- ✅ Weaviate running
- ✅ Neo4j running

**Rubric Mapping**: "System runs in Docker"

---

#### TEST 16: Service Communication
**File**: `test_docker.sh`

**Validates**:
- Backend → Weaviate connection
- Backend → Neo4j connection
- Frontend → Backend connection

**Pass Criteria**:
- ✅ All services reachable
- ✅ Inter-service communication works

**Rubric Mapping**: "Services communicate correctly"

---

### 9. API ENDPOINTS (2 points)

#### TEST 12-14: API Validation
**Files**: `test_rubric_validation.py::TestAPIEndpoints`

**Validates**:
- `/health` endpoint
- `/upload` endpoint
- `/query` endpoint
- Response structures

**Pass Criteria**:
- ✅ All endpoints return 200
- ✅ Response schemas correct

**Rubric Mapping**: "API endpoints functional"

---

## 🚀 Running the Tests

### Quick Start
```bash
# Run all tests
bash run_all_tests.sh

# Run specific test suites
cd backend
pytest test_rubric_validation.py -v    # Rubric tests
pytest test_metrics.py -v               # Metrics tests
pytest test_main.py -v                  # Unit tests

# Run Docker tests
bash test_docker.sh

# Run frontend tests
npm test
```

### Prerequisites
```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
npm install

# Start services
docker-compose up -d
python backend/main.py
```

---

## 📊 Expected Results

### Passing Criteria
- **Unit Tests**: 8/8 passing
- **Rubric Tests**: 16/16 passing
- **Metrics Tests**: 6/6 passing
- **Docker Tests**: All services running
- **Frontend Tests**: 28/28 passing

### Total Coverage
- **Backend**: > 80% code coverage
- **Frontend**: > 75% code coverage
- **Integration**: All endpoints tested

---

## 🎓 Grading Rubric Mapping

| Requirement | Test(s) | Points | Status |
|-------------|---------|--------|--------|
| Multi-modal ingestion | TEST 1-3 | 20 | ✅ |
| Vector search (Weaviate) | TEST 4 | 15 | ✅ |
| Graph search (Neo4j) | TEST 5 | 15 | ✅ |
| Hybrid retrieval | TEST 6 | 20 | ✅ |
| Reranker | TEST 7 | 10 | ✅ |
| LLM grounding | TEST 8-9 | 10 | ✅ |
| Metrics | TEST 9-14 | 5 | ✅ |
| Docker deployment | TEST 15-16 | 3 | ✅ |
| Code quality | All tests | 2 | ✅ |
| **TOTAL** | **20 tests** | **100** | **✅** |

---

## 📝 Submission Checklist

Before submitting, verify:

- [ ] All 20 tests passing
- [ ] Test coverage > 80%
- [ ] Docker Compose working
- [ ] README.md updated
- [ ] Git workflow documented
- [ ] Demo data prepared
- [ ] Screenshots/videos captured
- [ ] Code commented
- [ ] Requirements.txt complete
- [ ] .env.example provided

---

## 🐛 Troubleshooting

### Tests Failing?

1. **Backend not running**: `python backend/main.py`
2. **Docker not running**: `docker-compose up -d`
3. **Dependencies missing**: `pip install -r requirements.txt`
4. **Port conflicts**: Check ports 3000, 8000, 8080, 7474, 7687

### Common Issues

- **Import errors**: Ensure you're in correct directory
- **Connection refused**: Check if services are running
- **Timeout errors**: Increase timeout in test configuration
- **Memory errors**: Reduce batch size or use smaller models

---

## 📚 Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Weaviate Docs](https://weaviate.io/developers/weaviate)
- [Neo4j Docs](https://neo4j.com/docs/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

**Last Updated**: 2026-04-30  
**Test Suite Version**: 1.0  
**Maintainer**: Smart Multi-Modal Education Tutor Team
