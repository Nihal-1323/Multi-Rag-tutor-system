"""Test POST request with query parameters (like frontend sends)"""
import requests

BASE_URL = "http://localhost:8000"

# First upload a document
test_content = "Machine learning is a subset of artificial intelligence."
with open("test_ml.txt", "w") as f:
    f.write(test_content)

print("1. Uploading document...")
with open("test_ml.txt", "rb") as f:
    response = requests.post(f"{BASE_URL}/upload", files={'file': f})
    print(f"   Status: {response.status_code}")

# Test POST with query parameters (like frontend does)
print("\n2. Testing POST with query parameters...")
response = requests.post(f"{BASE_URL}/query?query=what%20is%20machine%20learning&session_id=test")
print(f"   Status: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    print(f"   Answer: {result['answer'][:100]}...")
    print(f"   ✅ POST with query params works!")
else:
    print(f"   ❌ Failed: {response.text}")

# Cleanup
import os
os.remove("test_ml.txt")
