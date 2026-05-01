"""
Modular Retrieval System - Pluggable retrievers for different modalities
Uses embeddings for semantic search with Weaviate
"""
from typing import List, Dict, Optional, Protocol
from dataclasses import dataclass
from abc import ABC, abstractmethod
import re
import numpy as np
import logging

logger = logging.getLogger(__name__)


@dataclass
class RetrievalResult:
    """Unified retrieval result across modalities"""
    doc_id: str
    content: str
    score: float
    modality: str  # "text", "image", "graph", etc.
    metadata: Dict
    raw_data: Optional[bytes] = None  # For images, audio, etc.


class Retriever(Protocol):
    """Protocol for all retrievers"""
    
    def retrieve(self, query: str, top_k: int = 10) -> List[RetrievalResult]:
        """Retrieve relevant documents"""
        ...
    
    def get_modality(self) -> str:
        """Return modality type"""
        ...


class SemanticRetriever:
    """
    Semantic retrieval using embeddings with Weaviate.
    Falls back to in-memory search if Weaviate unavailable.
    """
    
    def __init__(self, document_store: Dict, embedding_service=None):
        self.document_store = document_store
        self.modality = "text"
        self.embedding_service = embedding_service
        self.document_embeddings = {}  # Cache embeddings
    
    def retrieve(self, query: str, top_k: int = 10) -> List[RetrievalResult]:
        """
        Semantic search using embeddings.
        Priority: Weaviate > In-memory embeddings > Keyword matching
        """
        results = []
        
        # Try embedding-based search (in-memory or Weaviate)
        if self.embedding_service and self.embedding_service._initialized:
            try:
                return self._retrieve_with_embeddings(query, top_k)
            except Exception as e:
                logger.warning(f"Embedding search failed, falling back to keyword: {e}")
        
        # Fallback to keyword matching
        query_lower = query.lower()
        query_words = [w for w in query_lower.split() if len(w) > 2]
        
        for doc_id, doc_data in self.document_store.items():
            # Skip images and audio for text retrieval
            if doc_data.get("is_image", False) or doc_data.get("is_audio", False):
                continue
            
            content = doc_data["content"]
            content_lower = content.lower()
            
            # Calculate semantic score
            score = self._calculate_semantic_score(query_lower, query_words, content_lower)
            
            if score > 0:
                results.append(RetrievalResult(
                    doc_id=doc_id,
                    content=content,
                    score=score,
                    modality="text",
                    metadata={
                        "type": doc_data["type"],
                        "size": doc_data["size"],
                        "concepts": doc_data.get("concepts", [])
                    }
                ))
        
        # Sort by score
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]
    
    def _retrieve_with_embeddings(self, query: str, top_k: int) -> List[RetrievalResult]:
        """Retrieve using embedding similarity (in-memory)"""
        # Generate query embedding
        query_embedding = self.embedding_service.embed_text(query)[0]
        
        results = []
        
        for doc_id, doc_data in self.document_store.items():
            # Skip non-text documents
            if doc_data.get("is_image", False) or doc_data.get("is_audio", False):
                continue
            
            # Get or compute document embedding
            if doc_id not in self.document_embeddings:
                content = doc_data["content"]
                self.document_embeddings[doc_id] = self.embedding_service.embed_text(content)[0]
            
            doc_embedding = self.document_embeddings[doc_id]
            
            # Compute similarity
            similarity = self.embedding_service.compute_similarity(query_embedding, doc_embedding)
            score = similarity * 100  # Scale to 0-100
            
            if score > 10:  # Threshold
                results.append(RetrievalResult(
                    doc_id=doc_id,
                    content=doc_data["content"],
                    score=score,
                    modality="text",
                    metadata={
                        "type": doc_data["type"],
                        "size": doc_data["size"],
                        "concepts": doc_data.get("concepts", []),
                        "similarity": similarity
                    }
                ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]
    
    def _calculate_semantic_score(self, query: str, query_words: List[str], 
                                  content: str) -> float:
        """Calculate semantic relevance score"""
        score = 0.0
        
        # Exact phrase match
        if query in content:
            score += 100.0
        
        # Word frequency
        for word in query_words:
            count = content.count(word)
            score += count * 5.0
        
        # Proximity bonus
        if len(query_words) >= 2:
            for i in range(len(query_words) - 1):
                pattern = f"{query_words[i]}.{{0,50}}{query_words[i+1]}"
                if re.search(pattern, content):
                    score += 20.0
        
        return score
    
    def get_modality(self) -> str:
        return self.modality


class VisionRetriever:
    """
    Vision-based retrieval for images using CLIP embeddings.
    """
    
    def __init__(self, document_store: Dict, embedding_service=None):
        self.document_store = document_store
        self.modality = "image"
        self.embedding_service = embedding_service
        self.image_embeddings = {}  # Cache embeddings
    
    def retrieve(self, query: str, top_k: int = 10) -> List[RetrievalResult]:
        """Retrieve relevant images"""
        
        # Try embedding-based search first
        if self.embedding_service and self.embedding_service._initialized:
            try:
                return self._retrieve_with_embeddings(query, top_k)
            except Exception as e:
                logger.warning(f"Image embedding search failed, falling back: {e}")
        
        # Fallback to keyword matching
        results = []
        query_lower = query.lower()
        
        for doc_id, doc_data in self.document_store.items():
            # Only process images
            if not doc_data.get("is_image", False):
                continue
            
            content = doc_data["content"]
            content_lower = content.lower()
            
            # Calculate visual relevance score
            score = self._calculate_visual_score(query_lower, content_lower)
            
            if score > 0:
                results.append(RetrievalResult(
                    doc_id=doc_id,
                    content=content,
                    score=score,
                    modality="image",
                    metadata={
                        "type": doc_data["type"],
                        "size": doc_data["size"],
                        "image_description": doc_data.get("image_description", "")
                    },
                    raw_data=doc_data.get("raw_content")
                ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]
    
    def _retrieve_with_embeddings(self, query: str, top_k: int) -> List[RetrievalResult]:
        """Retrieve using CLIP embeddings"""
        # Generate query embedding using CLIP text encoder
        query_embedding = self.embedding_service.embed_text_with_clip(query)[0]
        
        results = []
        
        for doc_id, doc_data in self.document_store.items():
            # Only process images
            if not doc_data.get("is_image", False):
                continue
            
            # Get or compute image embedding
            if doc_id not in self.image_embeddings:
                raw_content = doc_data.get("raw_content")
                if raw_content:
                    self.image_embeddings[doc_id] = self.embedding_service.embed_image(raw_content)
                else:
                    continue
            
            image_embedding = self.image_embeddings[doc_id]
            
            # Compute similarity
            similarity = self.embedding_service.compute_similarity(query_embedding, image_embedding)
            score = similarity * 100  # Scale to 0-100
            
            if score > 10:  # Threshold
                results.append(RetrievalResult(
                    doc_id=doc_id,
                    content=doc_data["content"],
                    score=score,
                    modality="image",
                    metadata={
                        "type": doc_data["type"],
                        "size": doc_data["size"],
                        "image_description": doc_data.get("image_description", ""),
                        "similarity": similarity
                    },
                    raw_data=doc_data.get("raw_content")
                ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]
    
    def _calculate_visual_score(self, query: str, content: str) -> float:
        """Calculate visual relevance score"""
        score = 0.0
        
        # Base score for any image
        score += 10.0
        
        # Check for visual attributes in description
        visual_attrs = ["color", "colour", "shape", "size", "object", "contains"]
        for attr in visual_attrs:
            if attr in query and attr in content:
                score += 50.0
        
        # Check for query terms in image description
        query_words = [w for w in query.split() if len(w) > 2]
        for word in query_words:
            if word in content:
                score += 30.0
        
        return score
    
    def get_modality(self) -> str:
        return self.modality


class GraphRetriever:
    """
    Graph-based retrieval using knowledge graph.
    Finds related concepts and documents.
    """
    
    def __init__(self, knowledge_graph: Dict, document_store: Dict):
        self.knowledge_graph = knowledge_graph
        self.document_store = document_store
        self.modality = "graph"


class AudioRetriever:
    """
    Audio-based retrieval using transcription embeddings.
    """
    
    def __init__(self, document_store: Dict, embedding_service=None):
        self.document_store = document_store
        self.modality = "audio"
        self.embedding_service = embedding_service
        self.audio_embeddings = {}  # Cache embeddings
    
    def retrieve(self, query: str, top_k: int = 10) -> List[RetrievalResult]:
        """Retrieve relevant audio files"""
        
        # Try embedding-based search first
        if self.embedding_service and self.embedding_service._initialized:
            try:
                return self._retrieve_with_embeddings(query, top_k)
            except Exception as e:
                logger.warning(f"Audio embedding search failed, falling back: {e}")
        
        # Fallback to keyword matching on transcriptions
        results = []
        query_lower = query.lower()
        query_words = [w for w in query_lower.split() if len(w) > 2]
        
        for doc_id, doc_data in self.document_store.items():
            # Only process audio
            if not doc_data.get("is_audio", False):
                continue
            
            content = doc_data["content"]  # Transcription
            content_lower = content.lower()
            
            # Calculate relevance score
            score = 0.0
            
            # Base score for any audio
            score += 10.0
            
            # Word frequency
            for word in query_words:
                count = content_lower.count(word)
                score += count * 5.0
            
            # Exact phrase match
            if query_lower in content_lower:
                score += 50.0
            
            if score > 0:
                results.append(RetrievalResult(
                    doc_id=doc_id,
                    content=content,
                    score=score,
                    modality="audio",
                    metadata={
                        "type": doc_data["type"],
                        "size": doc_data["size"],
                        "transcription": doc_data.get("transcription", ""),
                        "duration": doc_data.get("duration", 0)
                    },
                    raw_data=doc_data.get("raw_content")
                ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]
    
    def _retrieve_with_embeddings(self, query: str, top_k: int) -> List[RetrievalResult]:
        """Retrieve using embedding similarity on transcriptions"""
        # Generate query embedding
        query_embedding = self.embedding_service.embed_text(query)[0]
        
        results = []
        
        for doc_id, doc_data in self.document_store.items():
            # Only process audio
            if not doc_data.get("is_audio", False):
                continue
            
            # Get or compute audio embedding (from transcription)
            if doc_id not in self.audio_embeddings:
                transcription = doc_data.get("transcription", "")
                if transcription:
                    self.audio_embeddings[doc_id] = self.embedding_service.embed_text(transcription)[0]
                else:
                    continue
            
            audio_embedding = self.audio_embeddings[doc_id]
            
            # Compute similarity
            similarity = self.embedding_service.compute_similarity(query_embedding, audio_embedding)
            score = similarity * 100  # Scale to 0-100
            
            if score > 10:  # Threshold
                results.append(RetrievalResult(
                    doc_id=doc_id,
                    content=doc_data["content"],
                    score=score,
                    modality="audio",
                    metadata={
                        "type": doc_data["type"],
                        "size": doc_data["size"],
                        "transcription": doc_data.get("transcription", ""),
                        "duration": doc_data.get("duration", 0),
                        "similarity": similarity
                    },
                    raw_data=doc_data.get("raw_content")
                ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]
    
    def get_modality(self) -> str:
        return self.modality


class GraphRetriever:
    """
    Graph-based retrieval using knowledge graph.
    Finds related concepts and documents.
    """
    
    def __init__(self, knowledge_graph: Dict, document_store: Dict):
        self.knowledge_graph = knowledge_graph
        self.document_store = document_store
        self.modality = "graph"
    
    def retrieve(self, query: str, top_k: int = 10) -> List[RetrievalResult]:
        """Retrieve via graph traversal"""
        results = []
        query_lower = query.lower()
        
        # Find matching nodes
        matching_nodes = []
        for node in self.knowledge_graph.get("nodes", []):
            node_id = node["id"].lower()
            if any(word in node_id for word in query_lower.split() if len(word) > 2):
                matching_nodes.append(node["id"])
        
        # Find connected documents
        for link in self.knowledge_graph.get("links", []):
            if link["source"] in matching_nodes or link["target"] in matching_nodes:
                # Check if target is a document
                doc_id = link["target"] if link["source"] in matching_nodes else link["source"]
                
                if doc_id in self.document_store:
                    doc_data = self.document_store[doc_id]
                    results.append(RetrievalResult(
                        doc_id=doc_id,
                        content=doc_data["content"],
                        score=50.0,  # Graph-based score
                        modality="graph",
                        metadata={
                            "type": doc_data["type"],
                            "concepts": doc_data.get("concepts", []),
                            "graph_path": f"{link['source']} -> {link['target']}"
                        }
                    ))
        
        # Deduplicate
        seen = set()
        unique_results = []
        for r in results:
            if r.doc_id not in seen:
                seen.add(r.doc_id)
                unique_results.append(r)
        
        return unique_results[:top_k]
    
    def get_modality(self) -> str:
        return self.modality


class HybridRetriever:
    """
    Combines multiple retrievers with intelligent fusion.
    """
    
    def __init__(self, retrievers: List[Retriever]):
        self.retrievers = retrievers
    
    def retrieve(self, query: str, modality_weights: Optional[Dict[str, float]] = None,
                top_k: int = 10) -> List[RetrievalResult]:
        """
        Retrieve from all sources and fuse results.
        
        Args:
            query: Search query
            modality_weights: Optional weights for each modality (e.g., {"text": 0.7, "image": 0.3})
            top_k: Number of results to return
        """
        all_results = []
        
        # Retrieve from each source
        for retriever in self.retrievers:
            modality = retriever.get_modality()
            results = retriever.retrieve(query, top_k=top_k * 2)  # Get more for fusion
            
            # Apply modality weight
            weight = modality_weights.get(modality, 1.0) if modality_weights else 1.0
            
            for result in results:
                result.score *= weight
                all_results.append(result)
        
        # Deduplicate and merge scores
        merged = {}
        for result in all_results:
            if result.doc_id in merged:
                # Take max score across modalities
                if result.score > merged[result.doc_id].score:
                    merged[result.doc_id] = result
            else:
                merged[result.doc_id] = result
        
        # Sort by final score
        final_results = sorted(merged.values(), key=lambda x: x.score, reverse=True)
        
        return final_results[:top_k]
