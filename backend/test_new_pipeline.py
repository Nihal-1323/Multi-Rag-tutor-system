"""
Test the new modular multi-modal RAG pipeline
"""
import sys
sys.path.append('.')

from app.core.query_understanding import query_understanding, QueryIntent, ModalityRequirement
from app.core.retrieval import SemanticRetriever, VisionRetriever, HybridRetriever, RetrievalResult
from app.core.reranking import reranker
from app.core.fusion import AdaptiveFusion


def test_query_understanding():
    """Test query understanding module"""
    print("\n" + "="*60)
    print("TEST 1: Query Understanding")
    print("="*60)
    
    test_queries = [
        "what is there in the ball.jpg",
        "what color is the ball",
        "explain neural networks from UNIT 3",
        "compare the diagram to the text explanation",
    ]
    
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        analysis = query_understanding.analyze(query)
        print(f"  Intent: {analysis.intent.value}")
        print(f"  Modality: {analysis.modality_requirement.value}")
        print(f"  Entities: {analysis.entities}")
        print(f"  Visual Attrs: {analysis.visual_attributes}")
        print(f"  Confidence: {analysis.confidence:.2f}")
        print(f"  Reasoning: {analysis.reasoning}")


def test_retrieval():
    """Test retrieval system"""
    print("\n" + "="*60)
    print("TEST 2: Retrieval System")
    print("="*60)
    
    # Mock document store
    mock_store = {
        "ball.jpg": {
            "content": "[Image: ball.jpg]\nDescription: An orange basketball on a wooden floor\nColors: orange, brown\nObjects: ball, basketball, floor",
            "type": "image/jpeg",
            "size": 50000,
            "is_image": True,
            "concepts": []
        },
        "UNIT3.pdf": {
            "content": "Neural Networks are computational models inspired by biological neural networks. They consist of layers of interconnected nodes (neurons) that process information.",
            "type": "application/pdf",
            "size": 100000,
            "is_image": False,
            "concepts": ["Neural Networks", "Machine Learning"]
        },
        "UNIT5.pdf": {
            "content": "DevOps is a set of practices that combines software development and IT operations. It aims to shorten the development lifecycle.",
            "type": "application/pdf",
            "size": 80000,
            "is_image": False,
            "concepts": ["DevOps", "CI/CD"]
        }
    }
    
    # Test semantic retrieval
    print("\n--- Semantic Retrieval ---")
    semantic = SemanticRetriever(mock_store)
    results = semantic.retrieve("neural networks", top_k=3)
    for i, r in enumerate(results, 1):
        print(f"{i}. {r.doc_id} (score: {r.score:.1f}, modality: {r.modality})")
    
    # Test vision retrieval
    print("\n--- Vision Retrieval ---")
    vision = VisionRetriever(mock_store)
    results = vision.retrieve("what color is the ball", top_k=3)
    for i, r in enumerate(results, 1):
        print(f"{i}. {r.doc_id} (score: {r.score:.1f}, modality: {r.modality})")
    
    # Test hybrid retrieval with weights
    print("\n--- Hybrid Retrieval (Image-focused) ---")
    hybrid = HybridRetriever([semantic, vision])
    results = hybrid.retrieve(
        "what color is the ball",
        modality_weights={"image": 1.0, "text": 0.2},
        top_k=3
    )
    for i, r in enumerate(results, 1):
        print(f"{i}. {r.doc_id} (score: {r.score:.1f}, modality: {r.modality})")


def test_reranking():
    """Test reranking module"""
    print("\n" + "="*60)
    print("TEST 3: Reranking")
    print("="*60)
    
    # Mock results
    mock_results = [
        RetrievalResult(
            doc_id="UNIT3.pdf",
            content="Neural networks...",
            score=99.0,
            modality="text",
            metadata={}
        ),
        RetrievalResult(
            doc_id="ball.jpg",
            content="[Image] orange basketball",
            score=50.0,
            modality="image",
            metadata={}
        ),
    ]
    
    # Query analysis
    query = "what color is the ball"
    analysis = query_understanding.analyze(query)
    
    print(f"\nQuery: '{query}'")
    print(f"Intent: {analysis.intent.value}")
    print(f"Modality Requirement: {analysis.modality_requirement.value}")
    
    print("\n--- Before Reranking ---")
    for i, r in enumerate(mock_results, 1):
        print(f"{i}. {r.doc_id} ({r.modality}) - score: {r.score:.1f}")
    
    # Rerank
    ranked = reranker.rerank(mock_results, analysis, diversity_factor=0.2)
    
    print("\n--- After Reranking ---")
    for i, r in enumerate(ranked, 1):
        print(f"{i}. {r.result.doc_id} ({r.result.modality}) - "
              f"score: {r.reranked_score:.1f}, relevance: {r.relevance:.2f}")
        print(f"   Reasoning: {r.reasoning}")


def test_fusion_modes():
    """Test fusion mode selection"""
    print("\n" + "="*60)
    print("TEST 4: Fusion Mode Selection")
    print("="*60)
    
    fusion = AdaptiveFusion("http://localhost:11434", "llama2")
    
    test_cases = [
        {
            "modality_req": ModalityRequirement.IMAGE_ONLY,
            "image_conf": 0.9,
            "text_conf": 0.3,
            "has_vision": True,
            "expected": "image_only"
        },
        {
            "modality_req": ModalityRequirement.TEXT_ONLY,
            "image_conf": 0.5,
            "text_conf": 0.9,
            "has_vision": False,
            "expected": "text_only"
        },
        {
            "modality_req": ModalityRequirement.BALANCED,
            "image_conf": 0.7,
            "text_conf": 0.7,
            "has_vision": True,
            "expected": "hybrid"
        },
    ]
    
    for i, case in enumerate(test_cases, 1):
        mode = fusion._determine_fusion_mode(
            case["modality_req"],
            case["image_conf"],
            case["text_conf"],
            case["has_vision"]
        )
        status = "✓" if mode == case["expected"] else "✗"
        print(f"\nCase {i}: {status}")
        print(f"  Modality Req: {case['modality_req'].value}")
        print(f"  Image Conf: {case['image_conf']:.2f}, Text Conf: {case['text_conf']:.2f}")
        print(f"  Has Vision: {case['has_vision']}")
        print(f"  Expected: {case['expected']}, Got: {mode}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("TESTING NEW MODULAR MULTI-MODAL RAG PIPELINE")
    print("="*60)
    
    test_query_understanding()
    test_retrieval()
    test_reranking()
    test_fusion_modes()
    
    print("\n" + "="*60)
    print("ALL TESTS COMPLETED")
    print("="*60 + "\n")
