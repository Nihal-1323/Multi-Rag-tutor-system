"""
Weaviate Vector Database Integration
"""
import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.config import Configure, Property, DataType
import os
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class WeaviateClient:
    def __init__(self):
        self.client = None
        self.collection_name = "Documents"
        self.connected = False
        
    def connect(self):
        """Connect to Weaviate"""
        try:
            weaviate_url = os.getenv("WEAVIATE_URL", "http://localhost:8080")
            
            # Connect to Weaviate
            self.client = weaviate.connect_to_custom(
                http_host=weaviate_url.replace("http://", "").replace("https://", ""),
                http_port=8080,
                http_secure=False,
                grpc_host=weaviate_url.replace("http://", "").replace("https://", ""),
                grpc_port=50051,
                grpc_secure=False
            )
            
            # Create collection if it doesn't exist
            self._create_collection()
            
            self.connected = True
            logger.info(f"Connected to Weaviate at {weaviate_url}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Weaviate: {e}")
            self.connected = False
            return False
    
    def _create_collection(self):
        """Create Documents collection if it doesn't exist"""
        try:
            # Check if collection exists
            collections = self.client.collections.list_all()
            
            if self.collection_name not in [c.name for c in collections]:
                # Create collection
                self.client.collections.create(
                    name=self.collection_name,
                    properties=[
                        Property(name="filename", data_type=DataType.TEXT),
                        Property(name="content", data_type=DataType.TEXT),
                        Property(name="file_type", data_type=DataType.TEXT),
                        Property(name="concepts", data_type=DataType.TEXT_ARRAY),
                    ],
                    vectorizer_config=Configure.Vectorizer.none()  # We'll add vectors manually
                )
                logger.info(f"Created collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
    
    def add_document(self, filename: str, content: str, file_type: str, concepts: List[str], vector: Optional[List[float]] = None):
        """Add a document to Weaviate"""
        try:
            if not self.connected:
                return False
                
            collection = self.client.collections.get(self.collection_name)
            
            # Add document
            uuid = collection.data.insert(
                properties={
                    "filename": filename,
                    "content": content,
                    "file_type": file_type,
                    "concepts": concepts
                },
                vector=vector if vector else [0.0] * 384  # Default vector if none provided
            )
            
            logger.info(f"Added document: {filename} with UUID: {uuid}")
            return uuid
            
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            return None
    
    def search(self, query: str, limit: int = 5) -> List[Dict]:
        """Search documents using text similarity"""
        try:
            if not self.connected:
                return []
                
            collection = self.client.collections.get(self.collection_name)
            
            # Perform BM25 search (keyword-based)
            response = collection.query.bm25(
                query=query,
                limit=limit,
                return_properties=["filename", "content", "file_type", "concepts"]
            )
            
            results = []
            for obj in response.objects:
                results.append({
                    "filename": obj.properties.get("filename", ""),
                    "content": obj.properties.get("content", ""),
                    "file_type": obj.properties.get("file_type", ""),
                    "concepts": obj.properties.get("concepts", []),
                    "score": obj.metadata.score if hasattr(obj.metadata, 'score') else 0
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching: {e}")
            return []
    
    def get_all_documents(self) -> List[Dict]:
        """Get all documents"""
        try:
            if not self.connected:
                return []
                
            collection = self.client.collections.get(self.collection_name)
            
            response = collection.query.fetch_objects(
                limit=100,
                return_properties=["filename", "content", "file_type", "concepts"]
            )
            
            results = []
            for obj in response.objects:
                results.append({
                    "filename": obj.properties.get("filename", ""),
                    "content": obj.properties.get("content", ""),
                    "file_type": obj.properties.get("file_type", ""),
                    "concepts": obj.properties.get("concepts", [])
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting documents: {e}")
            return []
    
    def delete_document(self, filename: str) -> bool:
        """Delete a document by filename"""
        try:
            if not self.connected:
                return False
                
            collection = self.client.collections.get(self.collection_name)
            
            # Find and delete document
            response = collection.data.delete_many(
                where={
                    "path": ["filename"],
                    "operator": "Equal",
                    "valueText": filename
                }
            )
            
            logger.info(f"Deleted document: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False
    
    def close(self):
        """Close Weaviate connection"""
        if self.client:
            self.client.close()
            self.connected = False
            logger.info("Closed Weaviate connection")

# Global instance
weaviate_client = WeaviateClient()
