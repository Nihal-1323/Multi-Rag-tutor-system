"""
Intelligent Reranking Module - Modality-aware relevance scoring
"""
from typing import List, Dict
from dataclasses import dataclass
from .retrieval import RetrievalResult
from .query_understanding import QueryAnalysis, ModalityRequirement


@dataclass
class RankedResult:
    """Result after reranking"""
    result: RetrievalResult
    reranked_score: float
    relevance: float  # 0-1 normalized
    reasoning: str


class ModalityAwareReranker:
    """
    Reranks results based on query intent and modality requirements.
    Uses cross-modal understanding to boost/penalize results.
    """
    
    def __init__(self):
        # Modality compatibility matrix
        self.compatibility = {
            ModalityRequirement.IMAGE_ONLY: {
                "image": 1.0,
                "text": 0.1,
                "audio": 0.1,
                "graph": 0.2
            },
            ModalityRequirement.TEXT_ONLY: {
                "image": 0.1,
                "text": 1.0,
                "audio": 0.2,
                "graph": 0.8
            },
            ModalityRequirement.AUDIO_ONLY: {
                "image": 0.1,
                "text": 0.3,
                "audio": 1.0,
                "graph": 0.2
            },
            ModalityRequirement.IMAGE_PRIMARY: {
                "image": 1.0,
                "text": 0.5,
                "audio": 0.2,
                "graph": 0.4
            },
            ModalityRequirement.TEXT_PRIMARY: {
                "image": 0.4,
                "text": 1.0,
                "audio": 0.5,
                "graph": 0.7
            },
            ModalityRequirement.AUDIO_PRIMARY: {
                "image": 0.2,
                "text": 0.5,
                "audio": 1.0,
                "graph": 0.4
            },
            ModalityRequirement.BALANCED: {
                "image": 0.8,
                "text": 0.8,
                "audio": 0.8,
                "graph": 0.6
            }
        }
    
    def rerank(self, results: List[RetrievalResult], 
               query_analysis: QueryAnalysis,
               diversity_factor: float = 0.2) -> List[RankedResult]:
        """
        Rerank results based on query understanding.
        
        Args:
            results: Initial retrieval results
            query_analysis: Analyzed query intent and requirements
            diversity_factor: How much to promote diversity (0-1)
        """
        ranked_results = []
        
        # Get modality compatibility scores
        modality_req = query_analysis.modality_requirement
        compatibility_scores = self.compatibility.get(
            modality_req,
            {"image": 0.5, "text": 0.5, "graph": 0.5}
        )
        
        for result in results:
            # Base score from retrieval
            base_score = result.score
            
            # Modality compatibility boost/penalty
            modality_multiplier = compatibility_scores.get(result.modality, 0.5)
            
            # Entity matching bonus
            entity_bonus = self._calculate_entity_bonus(result, query_analysis.entities)
            
            # Visual attribute bonus (for image results)
            visual_bonus = 0.0
            if result.modality == "image" and query_analysis.visual_attributes:
                visual_bonus = self._calculate_visual_bonus(result, query_analysis.visual_attributes)
            
            # Calculate final score
            reranked_score = (base_score * modality_multiplier) + entity_bonus + visual_bonus
            
            # Normalize to 0-1 relevance
            relevance = min(1.0, reranked_score / 300.0)  # Assuming max score ~300
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                result.modality, modality_multiplier, entity_bonus, visual_bonus
            )
            
            ranked_results.append(RankedResult(
                result=result,
                reranked_score=reranked_score,
                relevance=relevance,
                reasoning=reasoning
            ))
        
        # Sort by reranked score
        ranked_results.sort(key=lambda x: x.reranked_score, reverse=True)
        
        # Apply diversity if requested
        if diversity_factor > 0:
            ranked_results = self._apply_diversity(ranked_results, diversity_factor)
        
        return ranked_results
    
    def _calculate_entity_bonus(self, result: RetrievalResult, entities: List[str]) -> float:
        """Bonus for matching entities"""
        bonus = 0.0
        content_lower = result.content.lower()
        doc_id_lower = result.doc_id.lower()
        
        for entity in entities:
            entity_lower = entity.lower()
            if entity_lower in doc_id_lower:
                bonus += 50.0  # Strong match in filename
            elif entity_lower in content_lower:
                bonus += 20.0  # Match in content
        
        return bonus
    
    def _calculate_visual_bonus(self, result: RetrievalResult, 
                                visual_attrs: List[str]) -> float:
        """Bonus for matching visual attributes"""
        bonus = 0.0
        content_lower = result.content.lower()
        
        for attr in visual_attrs:
            if attr in content_lower:
                bonus += 30.0
        
        return bonus
    
    def _generate_reasoning(self, modality: str, modality_mult: float,
                           entity_bonus: float, visual_bonus: float) -> str:
        """Generate human-readable reasoning"""
        parts = []
        
        if modality_mult > 0.8:
            parts.append(f"Strong modality match ({modality})")
        elif modality_mult < 0.3:
            parts.append(f"Weak modality match ({modality})")
        
        if entity_bonus > 0:
            parts.append(f"Entity match (+{entity_bonus:.0f})")
        
        if visual_bonus > 0:
            parts.append(f"Visual attribute match (+{visual_bonus:.0f})")
        
        return " | ".join(parts) if parts else "Base relevance"
    
    def _apply_diversity(self, ranked_results: List[RankedResult],
                        diversity_factor: float) -> List[RankedResult]:
        """
        Promote diversity in results (different modalities, sources).
        Uses Maximal Marginal Relevance (MMR) approach.
        """
        if len(ranked_results) <= 1:
            return ranked_results
        
        final_results = []
        remaining = ranked_results.copy()
        
        # Always take top result
        final_results.append(remaining.pop(0))
        
        while remaining and len(final_results) < len(ranked_results):
            best_idx = 0
            best_score = -float('inf')
            
            for idx, candidate in enumerate(remaining):
                # Relevance score
                relevance = candidate.reranked_score
                
                # Diversity score (how different from already selected)
                diversity = self._calculate_diversity(candidate, final_results)
                
                # MMR score
                mmr_score = (1 - diversity_factor) * relevance + diversity_factor * diversity
                
                if mmr_score > best_score:
                    best_score = mmr_score
                    best_idx = idx
            
            final_results.append(remaining.pop(best_idx))
        
        return final_results
    
    def _calculate_diversity(self, candidate: RankedResult,
                            selected: List[RankedResult]) -> float:
        """Calculate how diverse candidate is from selected results"""
        if not selected:
            return 1.0
        
        # Check modality diversity
        modalities_selected = {r.result.modality for r in selected}
        modality_diversity = 1.0 if candidate.result.modality not in modalities_selected else 0.3
        
        # Check content diversity (simple: different doc_id)
        doc_ids_selected = {r.result.doc_id for r in selected}
        content_diversity = 1.0 if candidate.result.doc_id not in doc_ids_selected else 0.0
        
        return (modality_diversity + content_diversity) / 2.0


# Singleton instance
reranker = ModalityAwareReranker()
