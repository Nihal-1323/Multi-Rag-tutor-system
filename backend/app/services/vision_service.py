"""
Vision Service - Image Understanding with LLaVA
"""
import requests
import base64
import os
import logging
from typing import Optional, Dict
from PIL import Image
import io

logger = logging.getLogger(__name__)

class VisionService:
    def __init__(self):
        self.ollama_url = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")
        self.vision_model = os.getenv("VISION_MODEL", "llava")
        self.available = False
        
    def check_availability(self) -> bool:
        """Check if vision model is available"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            if response.status_code == 200:
                models = response.json().get("models", [])
                self.available = any(self.vision_model in model.get("name", "") for model in models)
                return self.available
        except Exception as e:
            logger.error(f"Failed to check vision model availability: {e}")
            self.available = False
        return False
    
    def describe_image(self, image_bytes: bytes, prompt: str = "Describe this image in detail.") -> Optional[str]:
        """
        Generate a description of an image using LLaVA vision model
        
        Args:
            image_bytes: Raw image bytes
            prompt: Question or instruction about the image
            
        Returns:
            Description text or None if failed
        """
        try:
            # Convert image bytes to base64
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Call Ollama vision API
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.vision_model,
                    "prompt": prompt,
                    "images": [image_base64],
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9
                    }
                },
                timeout=60  # Vision models take longer
            )
            
            if response.status_code == 200:
                result = response.json()
                description = result.get("response", "").strip()
                logger.info(f"Generated image description: {description[:100]}...")
                return description
            else:
                logger.error(f"Vision API error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error describing image: {e}")
            return None
    
    def analyze_image(self, image_bytes: bytes) -> Dict[str, str]:
        """
        Comprehensive image analysis with multiple prompts
        
        Returns:
            Dictionary with different aspects of the image
        """
        analyses = {}
        
        # General description
        desc = self.describe_image(image_bytes, "Describe this image in detail, including colors, objects, and any text visible.")
        if desc:
            analyses["description"] = desc
        
        # Specific color analysis
        color_desc = self.describe_image(image_bytes, "What are the main colors in this image? List them.")
        if color_desc:
            analyses["colors"] = color_desc
        
        # Object detection
        objects = self.describe_image(image_bytes, "What objects or subjects can you see in this image? List them.")
        if objects:
            analyses["objects"] = objects
        
        return analyses
    
    def answer_about_image(self, image_bytes: bytes, question: str) -> Optional[str]:
        """
        Answer a specific question about an image
        
        Args:
            image_bytes: Raw image bytes
            question: User's question about the image
            
        Returns:
            Answer text or None if failed
        """
        try:
            # Convert image bytes to base64
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Create a focused, direct prompt
            # For simple queries (color, object), demand short answers
            simple_keywords = ["color", "colour", "what is", "what's", "object", "fruit"]
            is_simple = any(kw in question.lower() for kw in simple_keywords)
            
            if is_simple:
                prompt = f"{question}\n\nAnswer in ONE SHORT SENTENCE. Be direct and concise."
            else:
                prompt = f"Answer this question about the image: {question}\n\nProvide a clear, direct answer."
            
            # Call Ollama vision API
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.vision_model,
                    "prompt": prompt,
                    "images": [image_base64],
                    "stream": False,
                    "options": {
                        "temperature": 0.5,  # Lower temperature for factual answers
                        "top_p": 0.9
                    }
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                answer = result.get("response", "").strip()
                logger.info(f"Generated answer for image question: {answer[:100]}...")
                return answer
            else:
                logger.error(f"Vision API error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error answering about image: {e}")
            return None
    
    def extract_image_metadata(self, image_bytes: bytes) -> Dict:
        """Extract basic image metadata"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            return {
                "format": image.format,
                "mode": image.mode,
                "size": image.size,
                "width": image.width,
                "height": image.height
            }
        except Exception as e:
            logger.error(f"Error extracting image metadata: {e}")
            return {}

# Global instance
vision_service = VisionService()
