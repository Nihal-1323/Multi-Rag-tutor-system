"""
Direct test of the running system
"""
import requests

BASE_URL = "http://localhost:8000"

print("Testing Multi-Modal RAG System\n")

# Test 1: Health
print("1. Health Check...")
response = requests.get(f"{BASE_URL}/health")
print(f"   Status: {response.json()['status']}")
print(f"   Documents: {response.json()['documents']}\n")

# Test 2: Query with form data
print("2. Testing Query...")
try:
    # Try with files parameter (multipart/form-data)
    response = requests.post(
        f"{BASE_URL}/query",
        files={
            "query": (None, "what color is the ball"),
            "session_id": (None, "test")
        }
    )
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Success!")
        print(f"   Answer: {data.get('answer', 'No answer')[:100]}...")
        if 'debug' in data:
            print(f"   Mode: {data['debug'].get('fusion', {}).get('mode', 'N/A')}")
    else:
        print(f"   ❌ Error {response.status_code}")
        print(f"   {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Exception: {e}")

print("\nDone!")
