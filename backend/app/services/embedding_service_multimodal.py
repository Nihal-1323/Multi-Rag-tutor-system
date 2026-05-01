"""
Multi-Modal Embedding Service
Generates embeddings for text, images, and audio using state-of-the-art models
"""
import torch
import numpy as np
from typing import List, Optional, Union
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)


class MultiModalEmbeddingService:
    """
    Unified embedding service for text, images, and audio.
    Uses CLIP for text/image and Whisper + sentence-transformers for audio.
    """
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        # Text embeddings
        self.text_model = None
        self.text_model_name = "sentence-transformers/all-MiniLM-L6-v2"
        
        # Image embeddings (CLIP)
        self.clip_model = None
        self.clip_processor = None
        
        # Audio embeddings
        self.audio_model = None
        self.whisper_model = None
        
        self._initialized = False
    
    def initialize(self):
        """Lazy initialization of models"""
        if self._initialized:
            return
        
        try:
            logger.info("Initializing embedding models...")
            
            # 1. Text embeddings (sentence-transformers)
            logger.info(f"Loading text model: {self.text_model_name}")
            from sentence_transformers import SentenceTransformer
            self.text_model = SentenceTransformer(self.text_model_name)
            self.text_model.to(self.device)
            logger.info("✓ Text model loaded")
            
            # 2. Image embeddings (CLIP)
            logger.info("Loading CLIP model for images...")
            from transformers import CLIPProcessor, CLIPModel
            self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            self.clip_model.to(self.device)
            logger.info("✓ CLIP model loaded")
            
            # 3. Audio embeddings (Whisper for transcription + sentence-transformers)
            logger.info("Loading Whisper model for audio...")
            import whisper
            self.whisper_model = whisper.load_model("base")
            logger.info("✓ Whisper model loaded")
            
            self._initialized = True
            logger.info("All embedding models initialized successfully!")
            
        except Exception as e:
            logger.error(f"Error initializing embedding models: {e}")
            logger.warning("Falling back to basic embeddings")
            self._initialized = False
    
    def embed_text(self, text: Union[str, List[str]]) -> np.ndarray:
        """
        Generate embeddings for text.
        
        Args:
            text: Single text or list of texts
            
        Returns:
            numpy array of shape (n, embedding_dim)
        """
        if not self._initialized:
            self.initialize()
        
        if not self.text_model:
            # Fallback: simple hash-based embedding
            logger.warning("Text model not available, using fallback")
            return self._fallback_text_embedding(text)
        
        try:
            if isinstance(text, str):
                text = [text]
            
            embeddings = self.text_model.encode(
                text,
                convert_to_numpy=True,
                show_progress_bar=False
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Error generating text embeddings: {e}")
            return self._fallback_text_embedding(text)
    
    def embed_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Generate embeddings for image.
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            numpy array of shape (embedding_dim,)
        """
        if not self._initialized:
            self.initialize()
        
        if not self.clip_model:
            logger.warning("CLIP model not available, using fallback")
            return self._fallback_image_embedding(image_bytes)
        
        try:
            # Load image
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Process with CLIP
            inputs = self.clip_processor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                image_features = self.clip_model.get_image_features(**inputs)
            
            # Normalize
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            
            return image_features.cpu().numpy()[0]
            
        except Exception as e:
            logger.error(f"Error generating image embeddings: {e}")
            return self._fallback_image_embedding(image_bytes)
    
    def embed_audio(self, audio_bytes: bytes, sample_rate: int = 16000) -> np.ndarray:
        """
        Generate embeddings for audio.
        Strategy: Transcribe with Whisper, then embed the transcription.
        
        Args:
            audio_bytes: Raw audio bytes
            sample_rate: Audio sample rate
            
        Returns:
            numpy array of shape (embedding_dim,)
        """
        if not self._initialized:
            self.initialize()
        
        if not self.whisper_model:
            logger.warning("Whisper model not available, using fallback")
            return self._fallback_audio_embedding(audio_bytes)
        
        try:
            # Save audio to temp file (Whisper needs file path)
            import tempfile
            import soundfile as sf
            
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                tmp_path = tmp_file.name
                
                # Try to load audio
                try:
                    import librosa
                    audio_data, sr = librosa.load(io.BytesIO(audio_bytes), sr=sample_rate)
                    sf.write(tmp_path, audio_data, sample_rate)
                except:
                    # Fallback: write bytes directly
                    tmp_file.write(audio_bytes)
                    tmp_file.flush()
            
            # Transcribe with Whisper
            result = self.whisper_model.transcribe(tmp_path)
            transcription = result["text"]
            
            # Clean up
            import os
            os.unlink(tmp_path)
            
            # Embed the transcription
            if transcription.strip():
                return self.embed_text(transcription)[0]
            else:
                logger.warning("Empty transcription, using fallback")
                return self._fallback_audio_embedding(audio_bytes)
            
        except Exception as e:
            logger.error(f"Error generating audio embeddings: {e}")
            return self._fallback_audio_embedding(audio_bytes)
    
    def embed_text_with_clip(self, text: Union[str, List[str]]) -> np.ndarray:
        """
        Generate text embeddings using CLIP (for cross-modal similarity).
        
        Args:
            text: Single text or list of texts
            
        Returns:
            numpy array of shape (n, embedding_dim)
        """
        if not self._initialized:
            self.initialize()
        
        if not self.clip_model:
            return self.embed_text(text)
        
        try:
            if isinstance(text, str):
                text = [text]
            
            inputs = self.clip_processor(text=text, return_tensors="pt", padding=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                text_features = self.clip_model.get_text_features(**inputs)
            
            # Normalize (handle both tensor and model output)
            if hasattr(text_features, 'last_hidden_state'):
                # It's a model output object, extract the tensor
                text_features = text_features.pooler_output if hasattr(text_features, 'pooler_output') else text_features.last_hidden_state[:, 0]
            text_features = text_features / torch.norm(text_features, dim=-1, keepdim=True)
            
            return text_features.cpu().numpy()
            
        except Exception as e:
            logger.error(f"Error generating CLIP text embeddings: {e}")
            return self.embed_text(text)
    
    def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Compute cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Similarity score (0-1)
        """
        # Normalize
        embedding1 = embedding1 / np.linalg.norm(embedding1)
        embedding2 = embedding2 / np.linalg.norm(embedding2)
        
        # Cosine similarity
        similarity = np.dot(embedding1, embedding2)
        
        # Convert to 0-1 range
        return (similarity + 1) / 2
    
    # Fallback methods (simple hash-based)
    
    def _fallback_text_embedding(self, text: Union[str, List[str]]) -> np.ndarray:
        """Simple hash-based text embedding"""
        if isinstance(text, str):
            text = [text]
        
        embeddings = []
        for t in text:
            # Simple: use hash and convert to fixed-size vector
            hash_val = hash(t)
            embedding = np.array([float((hash_val >> i) & 0xFF) / 255.0 for i in range(0, 384, 8)])
            embeddings.append(embedding)
        
        return np.array(embeddings)
    
    def _fallback_image_embedding(self, image_bytes: bytes) -> np.ndarray:
        """Simple hash-based image embedding"""
        hash_val = hash(image_bytes)
        return np.array([float((hash_val >> i) & 0xFF) / 255.0 for i in range(0, 512, 8)])
    
    def _fallback_audio_embedding(self, audio_bytes: bytes) -> np.ndarray:
        """Simple hash-based audio embedding"""
        hash_val = hash(audio_bytes)
        return np.array([float((hash_val >> i) & 0xFF) / 255.0 for i in range(0, 384, 8)])
    
    def get_embedding_dim(self, modality: str) -> int:
        """Get embedding dimension for a modality"""
        if modality == "text":
            return 384  # all-MiniLM-L6-v2
        elif modality == "image":
            return 512  # CLIP
        elif modality == "audio":
            return 384  # Same as text (transcription)
        else:
            return 384


# Global instance
embedding_service = MultiModalEmbeddingService()
