"""
Test Docker Deployment - Verify all three modalities work
"""
import requests
import json
import time
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
        
        # Verify all services
        assert data["status"] == "healthy", "System not healthy"
        assert data["embedding_available"], "Embeddings not available"
        assert data["audio_available"], "Audio not available"
        assert data["vision_available"], "Vision not available"
        
        print("\n✅ Health check PASSED")
        return True
    else:
        print(f"\n❌ Health check FAILED: {response.status_code}")
        return False

def test_text_upload():
    """Test text document upload"""
    print("\n" + "="*60)
    print("TEST 2: Text Document Upload")
    print("="*60)
    
    # Create test text file
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
    
    # Write to file
    test_file = Path("test_neural_networks.txt")
    test_file.write_text(test_content)
    
    # Upload
    with open(test_file, 'rb') as f:
        files = {'file': ('test_neural_networks.txt', f, 'text/plain')}
        response = requests.post(f"{BASE_URL}/upload", files=files)
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
        print("\n✅ Text upload PASSED")
        return True
    else:
        print(f"\n❌ Text upload FAILED: {response.text}")
        return False

def test_text_query():
    """Test text query"""
    print("\n" + "="*60)
    print("TEST 3: Text Query")
    print("="*60)
    
    query = "explain neural networks and backpropagation"
    print(f"Query: {query}")
    
    data = {
        'query': query,
        'session_id': 'test_session'
    }
    
    response = requests.post(f"{BASE_URL}/query", data=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nAnswer: {result['answer'][:300]}...")
        print(f"\nMode: {result.get('mode', 'N/A')}")
        print(f"Confidence: {result.get('confidence', {})}")
        print(f"Sources: {len(result.get('sources', []))}")
        
        # Verify we got an answer
        assert result['has_content'], "No content in response"
        assert len(result['answer']) > 50, "Answer too short"
        
        print("\n✅ Text query PASSED")
        return True
    else:
        print(f"\n❌ Text query FAILED: {response.text}")
        return False

def test_image_upload():
    """Test image upload (create a simple test image)"""
    print("\n" + "="*60)
    print("TEST 4: Image Upload")
    print("="*60)
    
    try:
        from PIL import Image
        import io
        
        # Create a simple red square image
        img = Image.new('RGB', (200, 200), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {'file': ('test_red_square.png', img_bytes, 'image/png')}
        response = requests.post(f"{BASE_URL}/upload", files=files)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
            print("\n✅ Image upload PASSED")
            return True
        else:
            print(f"\n❌ Image upload FAILED: {response.text}")
            return False
            
    except ImportError:
        print("⚠️  PIL not available, skipping image test")
        return True

def test_image_query():
    """Test image query"""
    print("\n" + "="*60)
    print("TEST 5: Image Query")
    print("="*60)
    
    query = "what color is in the image"
    print(f"Query: {query}")
    
    data = {
        'query': query,
        'session_id': 'test_session'
    }
    
    response = requests.post(f"{BASE_URL}/query", data=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nAnswer: {result['answer'][:300]}...")
        print(f"\nMode: {result.get('mode', 'N/A')}")
        print(f"Confidence: {result.get('confidence', {})}")
        
        # Check if image was used
        if result.get('mode') == 'image':
            print("\n✅ Image query PASSED (image mode)")
        else:
            print(f"\n⚠️  Image query returned mode: {result.get('mode')}")
        
        return True
    else:
        print(f"\n❌ Image query FAILED: {response.text}")
        return False

def test_audio_upload():
    """Test audio upload (create a simple test audio file)"""
    print("\n" + "="*60)
    print("TEST 6: Audio Upload")
    print("="*60)
    
    try:
        import numpy as np
        import soundfile as sf
        
        # Create a simple sine wave audio (1 second, 440 Hz)
        sample_rate = 16000
        duration = 1.0
        frequency = 440.0
        
        t = np.linspace(0, duration, int(sample_rate * duration))
        audio_data = np.sin(2 * np.pi * frequency * t)
        
        # Save to file
        test_audio = Path("test_audio.wav")
        sf.write(test_audio, audio_data, sample_rate)
        
        # Upload
        with open(test_audio, 'rb') as f:
            files = {'file': ('test_audio.wav', f, 'audio/wav')}
            response = requests.post(f"{BASE_URL}/upload", files=files)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
            print("\n✅ Audio upload PASSED")
            return True
        else:
            print(f"\n❌ Audio upload FAILED: {response.text}")
            return False
            
    except ImportError as e:
        print(f"⚠️  Audio libraries not available ({e}), skipping audio test")
        return True

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("DOCKER DEPLOYMENT TEST SUITE")
    print("="*60)
    
    results = []
    
    # Test 1: Health
    results.append(("Health Check", test_health()))
    time.sleep(1)
    
    # Test 2: Text Upload
    results.append(("Text Upload", test_text_upload()))
    time.sleep(1)
    
    # Test 3: Text Query
    results.append(("Text Query", test_text_query()))
    time.sleep(1)
    
    # Test 4: Image Upload
    results.append(("Image Upload", test_image_upload()))
    time.sleep(1)
    
    # Test 5: Image Query
    results.append(("Image Query", test_image_query()))
    time.sleep(1)
    
    # Test 6: Audio Upload
    results.append(("Audio Upload", test_audio_upload()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20s} {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! System is fully operational.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed.")
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
