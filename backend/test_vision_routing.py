"""
Test Vision Routing - Verify strict multi-modal pipeline
"""
import requests
import time

BASE_URL = "http://localhost:8000"

def test_vision_query_routing():
    """Test that vision queries force image into context"""
    
    print("\n" + "="*60)
    print("TESTING VISION ROUTING")
    print("="*60)
    
    # Test queries
    vision_queries = [
        "what is in the image",
        "what color is the fruit",
        "what does this diagram show",
        "describe the picture"
    ]
    
    text_queries = [
        "what is machine learning",
        "explain neural networks"
    ]
    
    print("\n1. Testing VISION queries:")
    for query in vision_queries:
        response = requests.post(
            f"{BASE_URL}/query",
            params={"query": query, "session_id": "test"}
        )
        
        if response.status_code == 200:
            data = response.json()
            sources = data.get("sources", [])
            has_image = any(s.get("type") == "image" for s in sources)
            
            print(f"\nQuery: {query}")
            print(f"  → Image in sources: {has_image}")
            print(f"  → Answer preview: {data.get('answer', '')[:100]}")
            
            if not has_image:
                print("  ⚠️  WARNING: No image in sources for vision query!")
        else:
            print(f"  ❌ Error: {response.status_code}")
        
        time.sleep(0.5)
    
    print("\n2. Testing TEXT queries:")
    for query in text_queries:
        response = requests.post(
            f"{BASE_URL}/query",
            params={"query": query, "session_id": "test"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nQuery: {query}")
            print(f"  → Answer preview: {data.get('answer', '')[:100]}")
        else:
            print(f"  ❌ Error: {response.status_code}")
        
        time.sleep(0.5)
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)

if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Server is running")
            test_vision_query_routing()
        else:
            print("❌ Server not responding correctly")
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("Make sure backend is running: python backend/main.py")
