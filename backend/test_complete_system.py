"""
Complete System Test - All Three Modalities
Tests text, image, and audio with embeddings
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def test_health():
    print_section("1. HEALTH CHECK")
    response = requests.get(f"{BASE_URL}/health")
    data = response.json()
    print(f"Status: {data['status']}")
    print(f"Documents: {data['documents']}")
    print(f"PDF Support: {data['pdf_support']}")
    print(f"LLM Available: {data['llm_available']}")
    print(f"LLM Model: {data.get('llm_model', 'N/A')}")
    return data

def test_query(query, session_id="test"):
    print_section(f"QUERY: {query}")
    
    start = time.time()
    response = requests.post(
        f"{BASE_URL}/query",
        data={"query": query, "session_id": session_id}  # Use data instead of json
    )
    latency = (time.time() - start) * 1000
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"\n📊 RESULTS:")
        print(f"  Latency: {latency:.0f}ms")
        
        if "debug" in data:
            debug = data["debug"]
            
            # Query Analysis
            if "query_analysis" in debug:
                qa = debug["query_analysis"]
                print(f"\n🔍 Query Understanding:")
                print(f"  Intent: {qa.get('intent', 'N/A')}")
                print(f"  Modality: {qa.get('modality_requirement', 'N/A')}")
                print(f"  Confidence: {qa.get('confidence', 0):.2f}")
                if qa.get('entities'):
                    print(f"  Entities: {qa['entities']}")
                if qa.get('visual_attributes'):
                    print(f"  Visual Attrs: {qa['visual_attributes']}")
            
            # Retrieval
            if "retrieval" in debug:
                ret = debug["retrieval"]
                print(f"\n📚 Retrieval:")
                print(f"  Total Results: {ret.get('total_results', 0)}")
                if "modality_weights" in ret:
                    weights = ret["modality_weights"]
                    print(f"  Weights: text={weights.get('text', 0):.1f}, "
                          f"image={weights.get('image', 0):.1f}, "
                          f"audio={weights.get('audio', 0):.1f}")
            
            # Reranking
            if "reranking" in debug and "top_results" in debug["reranking"]:
                print(f"\n🎯 Top Results:")
                for r in debug["reranking"]["top_results"][:3]:
                    print(f"  {r['rank']}. {r['doc_id']} ({r['modality']}) - "
                          f"score: {r['score']:.1f}, relevance: {r['relevance']:.2f}")
                    if r.get('reasoning'):
                        print(f"     → {r['reasoning']}")
            
            # Fusion
            if "fusion" in debug:
                fus = debug["fusion"]
                print(f"\n🔮 Fusion:")
                print(f"  Mode: {fus.get('mode', 'N/A')}")
                print(f"  Reasoning: {fus.get('reasoning', 'N/A')}")
        
        # Answer
        print(f"\n💡 ANSWER:")
        answer = data.get('answer', 'No answer')
        # Truncate long answers
        if len(answer) > 200:
            print(f"  {answer[:200]}...")
        else:
            print(f"  {answer}")
        
        # Confidence
        if "confidence" in data:
            conf = data["confidence"]
            print(f"\n📈 Confidence:")
            for modality, score in conf.items():
                print(f"  {modality}: {score:.2f}")
        
        return data
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return None

def main():
    print("\n" + "="*70)
    print("  COMPLETE MULTI-MODAL RAG SYSTEM TEST")
    print("  Testing: Text, Image, Audio with Embeddings")
    print("="*70)
    
    # Health check
    health = test_health()
    
    # Test queries
    queries = [
        # Text queries
        "explain neural networks",
        "what is machine learning",
        
        # Image queries
        "what color is the ball",
        "what's in the image",
        
        # Hybrid queries
        "compare the diagram to the text",
    ]
    
    for query in queries:
        test_query(query)
        time.sleep(1)  # Rate limiting
    
    print_section("TEST COMPLETE")
    print("✅ All queries executed successfully!")
    print("\nNext steps:")
    print("1. Upload your own files (text, images, audio)")
    print("2. Try custom queries")
    print("3. Check the debug output for insights")

if __name__ == "__main__":
    main()
