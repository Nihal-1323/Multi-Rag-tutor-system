"""Quick test to upload and query"""
import requests
from pathlib import Path

BASE_URL = "http://localhost:8000"

# Create test document
test_content = """
Neural Networks and Deep Learning

Neural networks are computing systems inspired by biological neural networks.
They consist of interconnected nodes (neurons) organized in layers.

Key concepts:
- Input layer: receives data
- Hidden layers: process information
- Output layer: produces results
- Backpropagation: learning algorithm
- Gradient descent: optimization method

Deep learning uses neural networks with multiple hidden layers to learn
hierarchical representations of data.
"""

test_file = Path("test_doc.txt")
test_file.write_text(test_content)

print("1. Uploading document...")
with open(test_file, 'rb') as f:
    response = requests.post(f"{BASE_URL}/upload", files={'file': ('test_doc.txt', f, 'text/plain')})
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Upload successful")
    else:
        print(f"   ❌ Upload failed: {response.text}")

print("\n2. Querying...")
response = requests.get(f"{BASE_URL}/query", params={'query': 'explain neural networks', 'session_id': 'test'})
print(f"   Status: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    print(f"\n   Answer: {result['answer'][:200]}...")
    print(f"\n   Mode: {result.get('mode')}")
    print(f"   Sources: {len(result.get('sources', []))}")
    print(f"\n   ✅ Query successful!")
else:
    print(f"   ❌ Query failed: {response.text}")

# Cleanup
test_file.unlink()
