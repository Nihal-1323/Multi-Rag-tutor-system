"""
Complete RAG Pipeline - Orchestrates all components
"""
from typing import Dict, List, Optional
from .query_understanding import query_understanding, QueryAnalysis
from .retrieval import SemanticRetriever, VisionRetriever, GraphRetriever, AudioRetriever, HybridRetriever
from .reranking import reranker
from .fusion import AdaptiveFusion, FusionResult


class MultiModalRAGPipeline:
    """
    Complete multi-modal RAG pipeline.
    Orchestrates: Query Understanding → Retrieval → Reranking → Fusion
    """
    
    def __init__(self, document_store: Dict, knowledge_graph: Dict,
                 ollama_url: str, ollama_model: str, vision_service=None,
                 audio_service=None, embedding_service=None):
        """
        Initialize pipeline with all components.
        
        Args:
            document_store: In-memory document storage
            knowledge_graph: Knowledge graph structure
            ollama_url: Ollama API URL
            ollama_model: Ollama model name
            vision_service: Optional vision service for image analysis
            audio_service: Optional audio service for transcription
            embedding_service: Optional embedding service for semantic search
        """
        self.document_store = document_store
        self.knowledge_graph = knowledge_graph
        self.vision_service = vision_service
        self.audio_service = audio_service
        self.embedding_service = embedding_service
        
        # Initialize retrievers
        self.semantic_retriever = SemanticRetriever(document_store, embedding_service)
        self.vision_retriever = VisionRetriever(document_store, embedding_service)
        self.audio_retriever = AudioRetriever(document_store, embedding_service)
        self.graph_retriever = GraphRetriever(knowledge_graph, document_store)
        
        # Hybrid retriever combines all
        self.hybrid_retriever = HybridRetriever([
            self.semantic_retriever,
            self.vision_retriever,
            self.audio_retriever,
            self.graph_retriever
        ])
        
        # Fusion engine
        self.fusion_engine = AdaptiveFusion(ollama_url, ollama_model)
    
    def process_query(self, query: str, top_k: int = 5) -> Dict:
        """
        Process a query through the complete pipeline.
        
        Returns:
            Dict with answer, sources, confidence, and debug info
        """
        print(f"\n{'='*60}")
        print(f"PIPELINE: Processing query")
        print(f"QUERY: {query}")
        print(f"{'='*60}\n")
        
        # STEP 1: Query Understanding
        print("STEP 1: Query Understanding")
        query_analysis = query_understanding.analyze(query)
        print(f"  Intent: {query_analysis.intent.value}")
        print(f"  Modality: {query_analysis.modality_requirement.value}")
        print(f"  Confidence: {query_analysis.confidence:.2f}")
        print(f"  Reasoning: {query_analysis.reasoning}\n")
        
        # STEP 2: Adaptive Retrieval
        print("STEP 2: Adaptive Retrieval")
        modality_weights = self._get_modality_weights(query_analysis)
        print(f"  Modality weights: {modality_weights}")
        
        retrieval_results = self.hybrid_retriever.retrieve(
            query,
            modality_weights=modality_weights,
            top_k=top_k * 2  # Get more for reranking
        )
        print(f"  Retrieved {len(retrieval_results)} results\n")
        
        # STEP 3: Vision Processing (if needed)
        print("STEP 3: Vision Processing")
        vision_output = None
        if query_analysis.modality_requirement.value in ["image_only", "image_primary", "balanced"]:
            vision_output = self._process_vision(query, retrieval_results)
            if vision_output:
                print(f"  Vision output: {vision_output[:100]}...\n")
            else:
                print("  No vision output\n")
        else:
            print("  Skipped (text-only query)\n")
        
        # STEP 4: Intelligent Reranking
        print("STEP 4: Intelligent Reranking")
        ranked_results = reranker.rerank(
            retrieval_results,
            query_analysis,
            diversity_factor=0.2
        )
        print(f"  Reranked {len(ranked_results)} results")
        for i, ranked in enumerate(ranked_results[:3], 1):
            print(f"    {i}. {ranked.result.doc_id} ({ranked.result.modality}) - "
                  f"score: {ranked.reranked_score:.1f}, relevance: {ranked.relevance:.2f}")
        print()
        
        # STEP 5: Adaptive Fusion
        print("STEP 5: Adaptive Fusion")
        fusion_result = self.fusion_engine.fuse(
            query,
            ranked_results,
            query_analysis,
            vision_output
        )
        print(f"  Mode: {fusion_result.mode}")
        print(f"  Confidence: {fusion_result.confidence}")
        print(f"  Reasoning: {fusion_result.reasoning}\n")
        
        print(f"{'='*60}\n")
        
        # Format response
        return {
            "answer": fusion_result.answer,
            "sources": fusion_result.sources,
            "has_content": len(fusion_result.sources) > 0,
            "mode": fusion_result.mode,
            "confidence": fusion_result.confidence,
            "debug": {
                "query_analysis": {
                    "intent": query_analysis.intent.value,
                    "modality_requirement": query_analysis.modality_requirement.value,
                    "entities": query_analysis.entities,
                    "visual_attributes": query_analysis.visual_attributes,
                    "confidence": query_analysis.confidence,
                    "reasoning": query_analysis.reasoning
                },
                "retrieval": {
                    "total_results": len(retrieval_results),
                    "modality_weights": modality_weights
                },
                "reranking": {
                    "top_results": [
                        {
                            "doc_id": r.result.doc_id,
                            "modality": r.result.modality,
                            "score": r.reranked_score,
                            "relevance": r.relevance,
                            "reasoning": r.reasoning
                        }
                        for r in ranked_results[:5]
                    ]
                },
                "fusion": {
                    "mode": fusion_result.mode,
                    "reasoning": fusion_result.reasoning
                }
            }
        }
    
    def _get_modality_weights(self, query_analysis: QueryAnalysis) -> Dict[str, float]:
        """Calculate modality weights based on query analysis"""
        modality_req = query_analysis.modality_requirement
        
        weight_map = {
            "image_only": {"image": 1.0, "text": 0.1, "audio": 0.1, "graph": 0.2},
            "text_only": {"image": 0.1, "text": 1.0, "audio": 0.2, "graph": 0.8},
            "audio_only": {"image": 0.1, "text": 0.3, "audio": 1.0, "graph": 0.2},
            "image_primary": {"image": 1.0, "text": 0.5, "audio": 0.2, "graph": 0.4},
            "text_primary": {"image": 0.4, "text": 1.0, "audio": 0.5, "graph": 0.7},
            "audio_primary": {"image": 0.2, "text": 0.5, "audio": 1.0, "graph": 0.4},
            "balanced": {"image": 0.8, "text": 0.8, "audio": 0.8, "graph": 0.6}
        }
        
        return weight_map.get(modality_req.value, {"image": 0.5, "text": 0.5, "audio": 0.5, "graph": 0.5})
    
    def _process_vision(self, query: str, retrieval_results: List) -> Optional[str]:
        """Process images with vision model if available"""
        if not self.vision_service:
            return None
        
        # Find top image result
        image_results = [r for r in retrieval_results if r.modality == "image"]
        
        if not image_results:
            return None
        
        top_image = image_results[0]
        
        # Check if we already have description
        if top_image.metadata.get("image_description"):
            return top_image.metadata["image_description"]
        
        # Generate new description with vision model
        if top_image.raw_data and self.vision_service.check_availability():
            analyses = self.vision_service.analyze_image(top_image.raw_data)
            if analyses and "description" in analyses:
                return analyses["description"]
        
        return None
