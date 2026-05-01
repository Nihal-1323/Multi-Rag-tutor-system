"""
Query Understanding Module - Semantic intent classification
Replaces hardcoded keyword matching with ML-based understanding
"""
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import re


class QueryIntent(Enum):
    """Semantic query intents"""
    VISUAL_CONTENT = "visual_content"  # What's in the image?
    VISUAL_ATTRIBUTE = "visual_attribute"  # What color is X?
    AUDIO_CONTENT = "audio_content"  # What's in the audio?
    AUDIO_TRANSCRIPTION = "audio_transcription"  # Transcribe audio
    TEXT_RETRIEVAL = "text_retrieval"  # Explain concept Y
    COMPARISON = "comparison"  # Compare X and Y
    HYBRID = "hybrid"  # Needs multiple modalities
    UNKNOWN = "unknown"


class ModalityRequirement(Enum):
    """What modalities are needed"""
    IMAGE_ONLY = "image_only"
    TEXT_ONLY = "text_only"
    AUDIO_ONLY = "audio_only"
    IMAGE_PRIMARY = "image_primary"  # Image + text support
    TEXT_PRIMARY = "text_primary"  # Text + image support
    AUDIO_PRIMARY = "audio_primary"  # Audio + text support
    BALANCED = "balanced"  # Equal weight


@dataclass
class QueryAnalysis:
    """Structured query understanding"""
    intent: QueryIntent
    modality_requirement: ModalityRequirement
    entities: List[str]  # Extracted entities (e.g., "ball.jpg", "neural networks")
    visual_attributes: List[str]  # Color, shape, size, etc.
    confidence: float
    reasoning: str


class QueryUnderstanding:
    """
    Semantic query understanding using pattern matching and heuristics.
    Can be replaced with ML models (BERT, etc.) for production.
    """
    
    def __init__(self):
        # Visual content patterns (what's in the image)
        self.visual_content_patterns = [
            r"what.*(?:in|inside|within|shown in).*(?:image|picture|photo|diagram|figure)",
            r"(?:describe|explain|show me).*(?:image|picture|photo|diagram)",
            r"what.*(?:image|picture|photo).*(?:show|contain|display)",
            r"content.*(?:image|picture|photo)",
        ]
        
        # Visual attribute patterns (color, shape, etc.)
        self.visual_attribute_patterns = [
            r"what\s+(?:color|colour|shape|size|texture)",
            r"(?:color|colour|shape|size).*(?:is|of|in)",
            r"how.*(?:big|large|small|tall|wide)",
        ]
        
        # Audio content patterns
        self.audio_content_patterns = [
            r"what.*(?:in|said in|heard in).*(?:audio|recording|sound|speech)",
            r"(?:transcribe|transcript|what.*said)",
            r"(?:listen|hear|audio).*(?:say|contain|about)",
            r"what.*(?:audio|recording|sound).*(?:about|contain)",
        ]
        
        # Comparison patterns
        self.comparison_patterns = [
            r"(?:compare|difference|contrast|versus|vs)",
            r"(?:similar|different).*(?:between|from)",
            r"how.*(?:differ|relate|connect)",
        ]
        
        # Document reference patterns
        self.document_patterns = [
            r"(?:unit|chapter|section|page|document|pdf|file)\s+\d+",
            r"in\s+(?:unit|chapter|section|document|pdf|file)",
            r"according\s+to.*(?:document|pdf|file|text)",
        ]
        
        # Visual attributes vocabulary
        self.visual_attributes = {
            "color", "colour", "shape", "size", "texture", "pattern",
            "brightness", "contrast", "position", "location", "orientation"
        }
    
    def analyze(self, query: str) -> QueryAnalysis:
        """
        Analyze query to understand intent and modality requirements.
        This is a rule-based implementation that can be replaced with ML.
        """
        query_lower = query.lower()
        
        # Extract entities (filenames, concepts)
        entities = self._extract_entities(query)
        
        # Extract visual attributes
        visual_attrs = self._extract_visual_attributes(query_lower)
        
        # Detect intent
        intent = self._detect_intent(query_lower, entities, visual_attrs)
        
        # Determine modality requirement
        modality = self._determine_modality(query_lower, intent, entities, visual_attrs)
        
        # Calculate confidence
        confidence = self._calculate_confidence(query_lower, intent, modality)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(intent, modality, entities, visual_attrs)
        
        return QueryAnalysis(
            intent=intent,
            modality_requirement=modality,
            entities=entities,
            visual_attributes=visual_attrs,
            confidence=confidence,
            reasoning=reasoning
        )
    
    def _extract_entities(self, query: str) -> List[str]:
        """Extract named entities (filenames, concepts)"""
        entities = []
        
        # Extract filenames
        filename_pattern = r'\b[\w\-]+\.(jpg|jpeg|png|gif|pdf|txt|md)\b'
        filenames = re.findall(filename_pattern, query, re.IGNORECASE)
        entities.extend([f[0] for f in filenames])
        
        # Extract quoted terms
        quoted = re.findall(r'"([^"]+)"', query)
        entities.extend(quoted)
        
        # Extract capitalized terms (potential proper nouns)
        capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', query)
        entities.extend(capitalized)
        
        return list(set(entities))
    
    def _extract_visual_attributes(self, query_lower: str) -> List[str]:
        """Extract visual attributes mentioned in query"""
        found_attrs = []
        for attr in self.visual_attributes:
            if attr in query_lower:
                found_attrs.append(attr)
        return found_attrs
    
    def _detect_intent(self, query_lower: str, entities: List[str], 
                       visual_attrs: List[str]) -> QueryIntent:
        """Detect primary query intent"""
        
        # Check for comparison
        if any(re.search(pattern, query_lower) for pattern in self.comparison_patterns):
            return QueryIntent.COMPARISON
        
        # Check for audio content
        if any(re.search(pattern, query_lower) for pattern in self.audio_content_patterns):
            return QueryIntent.AUDIO_CONTENT
        
        # Check for visual content
        if any(re.search(pattern, query_lower) for pattern in self.visual_content_patterns):
            return QueryIntent.VISUAL_CONTENT
        
        # Check for visual attributes
        if visual_attrs or any(re.search(pattern, query_lower) 
                               for pattern in self.visual_attribute_patterns):
            return QueryIntent.VISUAL_ATTRIBUTE
        
        # Check for document reference
        if any(re.search(pattern, query_lower) for pattern in self.document_patterns):
            return QueryIntent.TEXT_RETRIEVAL
        
        # Check for audio file reference
        if any(ext in query_lower for ext in [".mp3", ".wav", ".m4a", ".ogg", "audio", "recording"]):
            return QueryIntent.AUDIO_CONTENT
        
        # Default to text retrieval for concept questions
        if any(word in query_lower for word in ["what", "explain", "define", "describe", "how"]):
            # If no visual/audio indicators, assume text
            indicators = ["image", "picture", "photo", "diagram", "figure", "visual", "audio", "sound", "recording"]
            if not any(ind in query_lower for ind in indicators):
                return QueryIntent.TEXT_RETRIEVAL
        
        return QueryIntent.UNKNOWN
    
    def _determine_modality(self, query_lower: str, intent: QueryIntent,
                           entities: List[str], visual_attrs: List[str]) -> ModalityRequirement:
        """Determine what modalities are needed"""
        
        if intent == QueryIntent.VISUAL_CONTENT:
            return ModalityRequirement.IMAGE_ONLY
        
        if intent == QueryIntent.VISUAL_ATTRIBUTE:
            return ModalityRequirement.IMAGE_PRIMARY
        
        if intent == QueryIntent.AUDIO_CONTENT or intent == QueryIntent.AUDIO_TRANSCRIPTION:
            return ModalityRequirement.AUDIO_ONLY
        
        if intent == QueryIntent.TEXT_RETRIEVAL:
            # Check if explicitly referencing documents
            if any(re.search(pattern, query_lower) for pattern in self.document_patterns):
                return ModalityRequirement.TEXT_ONLY
            return ModalityRequirement.TEXT_PRIMARY
        
        if intent == QueryIntent.COMPARISON:
            return ModalityRequirement.BALANCED
        
        # Unknown - be conservative, use balanced
        return ModalityRequirement.BALANCED
    
    def _calculate_confidence(self, query_lower: str, intent: QueryIntent,
                             modality: ModalityRequirement) -> float:
        """Calculate confidence in the analysis"""
        confidence = 0.5  # Base confidence
        
        # High confidence for clear patterns
        if intent in [QueryIntent.VISUAL_CONTENT, QueryIntent.VISUAL_ATTRIBUTE]:
            if any(re.search(pattern, query_lower) 
                   for pattern in self.visual_content_patterns + self.visual_attribute_patterns):
                confidence = 0.9
        
        if intent == QueryIntent.TEXT_RETRIEVAL:
            if any(re.search(pattern, query_lower) for pattern in self.document_patterns):
                confidence = 0.9
        
        # Medium confidence for heuristic-based
        if intent == QueryIntent.UNKNOWN:
            confidence = 0.3
        
        return confidence
    
    def _generate_reasoning(self, intent: QueryIntent, modality: ModalityRequirement,
                           entities: List[str], visual_attrs: List[str]) -> str:
        """Generate human-readable reasoning"""
        parts = [f"Intent: {intent.value}"]
        
        if entities:
            parts.append(f"Entities: {', '.join(entities)}")
        
        if visual_attrs:
            parts.append(f"Visual attributes: {', '.join(visual_attrs)}")
        
        parts.append(f"Modality: {modality.value}")
        
        return " | ".join(parts)


# Singleton instance
query_understanding = QueryUnderstanding()
