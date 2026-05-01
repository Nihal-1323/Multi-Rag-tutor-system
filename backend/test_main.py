import pytest
from fastapi.testclient import TestClient
from main import app, knowledge_graph, add_node, add_link
import io

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_graph():
    """Reset the knowledge graph before each test"""
    knowledge_graph["nodes"] = [
        {"id": "Mathematics", "val": 10},
        {"id": "Calculus", "val": 5},
        {"id": "Linear Algebra", "val": 5}
    ]
    knowledge_graph["links"] = [
        {"source": "Mathematics", "target": "Calculus"},
        {"source": "Mathematics", "target": "Linear Algebra"}
    ]
    yield


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_upload_document():
    """Test file upload endpoint"""
    # Create a mock file
    file_content = b"Mock PDF content"
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    
    response = client.post("/upload", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Successfully received test.pdf"
    assert data["content_type"] == "application/pdf"
    assert data["status"] == "processing"
    
    # Verify graph was updated
    graph_response = client.get("/graph")
    graph_data = graph_response.json()
    node_ids = [node["id"] for node in graph_data["nodes"]]
    assert "Uploaded Files" in node_ids
    assert "test.pdf" in node_ids


def test_query_tutor():
    """Test the query endpoint"""
    query = "What is calculus?"
    session_id = "test_session"
    
    response = client.post(f"/query?query={query}&session_id={session_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert query in data["answer"]
    assert "explanation" in data
    assert "sources" in data
    assert "graph_data" in data
    assert len(data["sources"]) > 0
    
    # Verify graph was updated
    graph_response = client.get("/graph")
    graph_data = graph_response.json()
    node_ids = [node["id"] for node in graph_data["nodes"]]
    assert "Queries" in node_ids
    assert query in node_ids


def test_get_full_graph():
    """Test the graph endpoint"""
    response = client.get("/graph")
    
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "links" in data
    assert len(data["nodes"]) == 3
    assert len(data["links"]) == 2
    
    # Verify initial structure
    node_ids = [node["id"] for node in data["nodes"]]
    assert "Mathematics" in node_ids
    assert "Calculus" in node_ids
    assert "Linear Algebra" in node_ids


def test_add_node_function():
    """Test the add_node helper function"""
    initial_count = len(knowledge_graph["nodes"])
    
    add_node("New Topic", val=7)
    assert len(knowledge_graph["nodes"]) == initial_count + 1
    
    # Test duplicate prevention
    add_node("New Topic", val=7)
    assert len(knowledge_graph["nodes"]) == initial_count + 1


def test_add_link_function():
    """Test the add_link helper function"""
    initial_count = len(knowledge_graph["links"])
    
    add_link("Calculus", "Linear Algebra")
    assert len(knowledge_graph["links"]) == initial_count + 1
    
    # Test duplicate prevention
    add_link("Calculus", "Linear Algebra")
    assert len(knowledge_graph["links"]) == initial_count + 1


def test_upload_with_metadata():
    """Test file upload with metadata"""
    file_content = b"Mock image content"
    files = {"file": ("diagram.png", io.BytesIO(file_content), "image/png")}
    data = {"metadata": '{"course": "Math101"}'}
    
    response = client.post("/upload", files=files, data=data)
    
    assert response.status_code == 200
    result = response.json()
    assert result["message"] == "Successfully received diagram.png"
    assert result["content_type"] == "image/png"


def test_multiple_queries_update_graph():
    """Test that multiple queries dynamically update the graph"""
    initial_node_count = len(knowledge_graph["nodes"])
    
    # First query
    client.post("/query?query=First question&session_id=test")
    graph1 = client.get("/graph").json()
    
    # Second query
    client.post("/query?query=Second question&session_id=test")
    graph2 = client.get("/graph").json()
    
    # Graph should have grown
    assert len(graph2["nodes"]) > len(graph1["nodes"])
    assert len(graph2["nodes"]) > initial_node_count
