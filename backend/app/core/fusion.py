"""
Adaptive Fusion Module - Confidence-based multi-modal answer generation
"""
from typing import List, Dict, Optional
from dataclasses import dataclass
from .reranking import RankedResult
from .query_understanding import QueryAnalysis, ModalityRequirement
import requests
import os


@dataclass
class FusionResult:
    """Final answer with sources and reasoning"""
    answer: str
    sources: List[Dict]
    confidence: Dict[str, float]
    mode: str
    reasoning: str


class AdaptiveFusion:
    """
    Generates answers by intelligently fusing multi-modal sources.
    Adapts strategy based on confidence and modality requirements.
    """
    
    def __init__(self, ollama_url: str, ollama_model: str):
        self.ollama_url = ollama_url
        self.ollama_model = ollama_model
    
    def fuse(self, query: str, ranked_results: List[RankedResult],
             query_analysis: QueryAnalysis, vision_output: Optional[str] = None) -> FusionResult:
        """
        Generate final answer by fusing multi-modal sources.
        
        Args:
            query: Original query
            ranked_results: Reranked retrieval results
            query_analysis: Query understanding
            vision_output: Optional vision model output
        """
        if not ranked_results:
            return self._generate_no_results_response(query)
        
        # Calculate modality confidences
        image_confidence = self._calculate_modality_confidence(ranked_results, "image")
        text_confidence = self._calculate_modality_confidence(ranked_results, "text")
        
        # Determine fusion mode
        mode = self._determine_fusion_mode(
            query_analysis.modality_requirement,
            image_confidence,
            text_confidence,
            vision_output is not None
        )
        
        # Generate answer based on mode
        if mode == "image_only":
            return self._generate_image_only_answer(
                query, ranked_results, vision_output, image_confidence, text_confidence
            )
        elif mode == "text_only":
            return self._generate_text_only_answer(
                query, ranked_results, image_confidence, text_confidence
            )
        else:  # hybrid
            return self._generate_hybrid_answer(
                query, ranked_results, vision_output, image_confidence, text_confidence
            )
    
    def _calculate_modality_confidence(self, ranked_results: List[RankedResult],
                                      modality: str) -> float:
        """Calculate confidence for a specific modality"""
        # Treat audio transcriptions as text for confidence calculation
        if modality == "text":
            modality_results = [r for r in ranked_results if r.result.modality in ["text", "audio"]]
        else:
            modality_results = [r for r in ranked_results if r.result.modality == modality]
        
        if not modality_results:
            return 0.0
        
        # Use top result's relevance as confidence
        top_relevance = modality_results[0].relevance
        
        # Boost if multiple high-quality results
        if len(modality_results) > 1 and modality_results[1].relevance > 0.5:
            top_relevance = min(1.0, top_relevance * 1.2)
        
        return top_relevance
    
    def _determine_fusion_mode(self, modality_req: ModalityRequirement,
                              image_conf: float, text_conf: float,
                              has_vision: bool) -> str:
        """Determine how to fuse results"""
        
        # Strong modality requirements
        if modality_req == ModalityRequirement.IMAGE_ONLY and has_vision:
            return "image_only"
        
        if modality_req == ModalityRequirement.TEXT_ONLY:
            return "text_only"
        
        # Confidence-based decision
        if image_conf > 0.7 and has_vision and image_conf > text_conf * 1.5:
            return "image_only"
        
        if text_conf > 0.7 and text_conf > image_conf * 1.5:
            return "text_only"
        
        # Default to hybrid if both available
        if has_vision and image_conf > 0.3 and text_conf > 0.3:
            return "hybrid"
        
        # Fallback
        return "text_only" if text_conf > image_conf else "image_only"
    
    def _generate_image_only_answer(self, query: str, ranked_results: List[RankedResult],
                                   vision_output: Optional[str], image_conf: float,
                                   text_conf: float) -> FusionResult:
        """Generate answer primarily from image"""
        
        if not vision_output:
            # Fallback to text
            return self._generate_text_only_answer(query, ranked_results, image_conf, text_conf)
        
        # Direct answer from vision
        answer = vision_output
        
        # Build sources list
        sources = []
        for i, ranked in enumerate(ranked_results[:5], 1):
            sources.append({
                "rank": i,
                "filename": ranked.result.doc_id,
                "score": ranked.result.score,
                "relevance": ranked.relevance,
                "type": ranked.result.modality,
                "reasoning": ranked.reasoning
            })
        
        return FusionResult(
            answer=answer,
            sources=sources,
            confidence={"image": image_conf, "text": text_conf},
            mode="image_only",
            reasoning="Answer derived directly from image analysis"
        )
    
    def _generate_text_only_answer(self, query: str, ranked_results: List[RankedResult],
                                  image_conf: float, text_conf: float) -> FusionResult:
        """Generate answer from text sources (including audio transcriptions)"""
        
        # Get text and audio results (audio transcriptions are treated as text)
        text_results = [r for r in ranked_results if r.result.modality in ["text", "audio"]]
        
        if not text_results:
            return self._generate_no_results_response(query)
        
        # Build context
        context_parts = []
        for i, ranked in enumerate(text_results[:3], 1):
            snippet = self._extract_snippet(ranked.result.content, query)
            context_parts.append(f"[Source {i}: {ranked.result.doc_id}]\n{snippet}\n")
        
        context = "\n".join(context_parts)
        
        # Generate with LLM
        llm_answer = self._generate_with_llm(query, context, vision_output=None)
        
        if llm_answer:
            answer = llm_answer
        else:
            # Fallback to snippet
            answer = f"**From {text_results[0].result.doc_id}:**\n\n{context_parts[0]}"
        
        # Build sources
        sources = []
        for i, ranked in enumerate(ranked_results[:5], 1):
            sources.append({
                "rank": i,
                "filename": ranked.result.doc_id,
                "score": ranked.result.score,
                "relevance": ranked.relevance,
                "type": ranked.result.modality,
                "reasoning": ranked.reasoning
            })
        
        return FusionResult(
            answer=answer,
            sources=sources,
            confidence={"image": image_conf, "text": text_conf},
            mode="text_only",
            reasoning="Answer derived from text documents"
        )
    
    def _generate_hybrid_answer(self, query: str, ranked_results: List[RankedResult],
                               vision_output: Optional[str], image_conf: float,
                               text_conf: float) -> FusionResult:
        """Generate answer combining image and text"""
        
        # Build text context (including audio transcriptions)
        text_results = [r for r in ranked_results if r.result.modality in ["text", "audio"]]
        context_parts = []
        for i, ranked in enumerate(text_results[:3], 1):
            snippet = self._extract_snippet(ranked.result.content, query)
            context_parts.append(f"[Source {i}: {ranked.result.doc_id}]\n{snippet}\n")
        
        context = "\n".join(context_parts)
        
        # Generate with LLM using both modalities
        llm_answer = self._generate_with_llm(query, context, vision_output=vision_output)
        
        if llm_answer:
            answer = llm_answer
        else:
            # Manual fusion fallback
            answer = ""
            if vision_output:
                answer += f"**From image analysis:**\n{vision_output}\n\n"
            if context:
                answer += f"**From documents:**\n{context_parts[0][:300]}"
        
        # Build sources
        sources = []
        for i, ranked in enumerate(ranked_results[:5], 1):
            sources.append({
                "rank": i,
                "filename": ranked.result.doc_id,
                "score": ranked.result.score,
                "relevance": ranked.relevance,
                "type": ranked.result.modality,
                "reasoning": ranked.reasoning
            })
        
        return FusionResult(
            answer=answer,
            sources=sources,
            confidence={"image": image_conf, "text": text_conf},
            mode="hybrid",
            reasoning="Answer derived from both image and text sources"
        )
    
    def _generate_with_llm(self, query: str, context: str,
                          vision_output: Optional[str] = None) -> Optional[str]:
        """Generate answer using LLM"""
        try:
            if vision_output:
                prompt = f"""You are a multi-modal AI tutor. Answer the question using both image and text context.

IMAGE CONTEXT:
{vision_output}

TEXT CONTEXT:
{context}

QUESTION: {query}

Provide a clear, concise answer that integrates information from both sources when relevant:"""
            else:
                prompt = f"""You are a helpful AI tutor. Answer the question using the provided context.

CONTEXT:
{context}

QUESTION: {query}

Provide a clear, concise answer:"""
            
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 500
                    }
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "").strip()
            
            return None
            
        except Exception as e:
            print(f"LLM generation error: {e}")
            return None
    
    def _extract_snippet(self, content: str, query: str, max_length: int = 400) -> str:
        """Extract relevant snippet from content"""
        query_lower = query.lower()
        content_lower = content.lower()
        
        # Find query position
        pos = content_lower.find(query_lower)
        
        if pos >= 0:
            start = max(0, pos - 100)
            end = min(len(content), pos + max_length)
        else:
            # Take beginning
            start = 0
            end = min(max_length, len(content))
        
        snippet = content[start:end].strip()
        
        if start > 0:
            snippet = "..." + snippet
        if end < len(content):
            snippet = snippet + "..."
        
        return snippet
    
    def _generate_no_results_response(self, query: str) -> FusionResult:
        """Generate response when no results found"""
        answer = f"""I don't have any documents that contain information about "{query}".

**Suggestions:**
- Upload relevant documents (PDF, text files, images)
- Try rephrasing your question with different keywords
- Check if your question matches the content in your files"""
        
        return FusionResult(
            answer=answer,
            sources=[],
            confidence={"image": 0.0, "text": 0.0},
            mode="none",
            reasoning="No relevant documents found"
        )
