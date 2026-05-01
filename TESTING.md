# Testing Documentation

This document describes the testing setup for the Smart Multi-Modal Education Tutor project.

## Backend Testing (Python/Pytest)

### Setup
Backend tests use `pytest` with `httpx` for API testing.

**Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

### Running Tests
```bash
cd backend
pytest test_main.py -v
```

### Test Coverage
- `test_health_check()` - Verifies health endpoint
- `test_upload_document()` - Tests file upload and graph updates
- `test_query_tutor()` - Tests query endpoint and response structure
- `test_get_full_graph()` - Verifies graph data retrieval
- `test_add_node_function()` - Tests node addition with duplicate prevention
- `test_add_link_function()` - Tests link addition with duplicate prevention
- `test_upload_with_metadata()` - Tests file upload with metadata
- `test_multiple_queries_update_graph()` - Verifies dynamic graph updates

## Frontend Testing (Vitest + React Testing Library)

### Setup
Frontend tests use Vitest with jsdom and React Testing Library.

**Install dependencies:**
```bash
npm install
```

### Running Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage

#### GraphView Component
- Renders component with title
- Fetches graph data on mount
- Displays refresh and maximize buttons
- Calls fetch when refresh button is clicked
- Handles fetch errors gracefully
- Displays query label and legend items

#### UploadManager Component
- Renders component with title
- Displays drop zone
- Shows empty state when no uploads
- Handles file drop
- Displays upload status (uploading → complete)
- Handles upload errors
- Handles drag over state
- Displays pipeline status

#### ChatInterface Component
- Renders component with title
- Displays initial welcome message
- Displays input field with placeholder
- Sends message when send button is clicked
- Sends message when Enter key is pressed
- Displays user message after sending
- Displays assistant response
- Displays typing indicator while waiting
- Displays sources when available
- Handles fetch errors gracefully
- Clears input after sending message
- Does not send empty messages
- Displays RAG pipeline badge

## Key Features

### Dynamic Graph Updates
The Knowledge Graph Visualizer now:
- Fetches data on mount
- Polls for updates every 3 seconds
- Has a manual refresh button
- Creates deep copies to avoid React Strict Mode mutation issues
- Dynamically updates when files are uploaded or queries are made

### Backend Graph State
The backend maintains an in-memory knowledge graph that:
- Starts with initial Mathematics nodes
- Adds nodes when files are uploaded
- Adds nodes when queries are made
- Prevents duplicate nodes and links
- Returns updated graph data with each query response

## Test Strategy

These tests verify the **current scaffolded behavior** with mocked responses. When you integrate real Weaviate/Neo4j connections:

1. Update backend tests to mock Weaviate and Neo4j services
2. Add integration tests for database connections
3. Update frontend tests if API response structures change
4. Consider adding E2E tests with Playwright or Cypress

## Continuous Integration

To add CI/CD:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```
