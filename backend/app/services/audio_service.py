"""
Audio Processing Service
Handles audio transcription and analysis
"""
import io
import logging
from typing import Dict, Optional
import numpy as np

logger = logging.getLogger(__name__)


class AudioService:
    """
    Audio processing service using Whisper for transcription.
    """
    
    def __init__(self):
        self.whisper_model = None
        self._initialized = False
    
    def initialize(self):
        """Lazy initialization"""
        if self._initialized:
            return
        
        try:
            logger.info("Initializing Whisper model...")
            import whisper
            self.whisper_model = whisper.load_model("base")
            self._initialized = True
            logger.info("✓ Whisper model loaded")
        except Exception as e:
            logger.error(f"Error loading Whisper: {e}")
            self._initialized = False
    
    def check_availability(self) -> bool:
        """Check if audio service is available"""
        if not self._initialized:
            self.initialize()
        return self._initialized and self.whisper_model is not None
    
    def transcribe_audio(self, audio_bytes: bytes) -> Optional[Dict]:
        """
        Transcribe audio to text.
        
        Args:
            audio_bytes: Raw audio bytes
            
        Returns:
            Dict with transcription and metadata
        """
        if not self.check_availability():
            return None
        
        try:
            import tempfile
            import os
            
            # Save to temp file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                tmp_path = tmp_file.name
                tmp_file.write(audio_bytes)
                tmp_file.flush()
            
            # Transcribe
            result = self.whisper_model.transcribe(tmp_path)
            
            # Clean up
            os.unlink(tmp_path)
            
            return {
                "text": result["text"],
                "language": result.get("language", "unknown"),
                "segments": result.get("segments", [])
            }
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            return None
    
    def analyze_audio(self, audio_bytes: bytes) -> Optional[Dict]:
        """
        Analyze audio file and extract features.
        
        Args:
            audio_bytes: Raw audio bytes
            
        Returns:
            Dict with analysis results
        """
        try:
            import librosa
            
            # Load audio
            audio_data, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000)
            
            # Extract features
            duration = len(audio_data) / sr
            
            # Transcribe
            transcription = self.transcribe_audio(audio_bytes)
            
            analysis = {
                "duration": duration,
                "sample_rate": sr,
                "transcription": transcription["text"] if transcription else "",
                "language": transcription.get("language", "unknown") if transcription else "unknown"
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing audio: {e}")
            return None


# Global instance
audio_service = AudioService()
