import torch
from transformers import CLIPProcessor, CLIPModel
import whisper
import os

class MultiModalEmbedder:
    def __init__(self):
        # Load CLIP for Images
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        
        # Load Whisper for Audio (Small model for CPU/preview)
        # In production, use 'large-v3' with GPU
        self.whisper_model = whisper.load_model("base")

    def embed_image(self, image_path: str):
        """Generate CLIP embeddings for an image."""
        from PIL import Image
        image = Image.open(image_path)
        inputs = self.clip_processor(images=image, return_tensors="pt")
        with torch.no_grad():
            image_features = self.clip_model.get_image_features(**inputs)
        return image_features.numpy().tolist()

    def transcribe_audio(self, audio_path: str):
        """Transcribe audio using Whisper."""
        result = self.whisper_model.transcribe(audio_path)
        return result["text"]

    def embed_text(self, text: str):
        """Generate text embeddings (using CLIP's text encoder or others)."""
        inputs = self.clip_processor(text=[text], return_tensors="pt", padding=True)
        with torch.no_grad():
            text_features = self.clip_model.get_text_features(**inputs)
        return text_features.numpy().tolist()
