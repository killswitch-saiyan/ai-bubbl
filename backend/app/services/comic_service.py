import os
import uuid
from typing import Optional, List
from app.core.database import db
from app.models.comic import Comic, ComicMetadata
from app.services.ai_service import ai_service


class ComicService:
    def __init__(self):
        self.db_client = db.get_client()
    
    def upload_comic(self, file_path: str, title: str, user_id: str) -> Comic:
        """Upload and process a new comic"""
        
        # Generate unique comic ID
        comic_id = str(uuid.uuid4())
        
        # Upload PDF to Supabase storage
        pdf_url = self._upload_pdf_to_storage(file_path, comic_id)
        
        # Process comic with AI
        metadata = ai_service.process_comic_pdf(file_path, title)
        
        # Save comic to database
        comic_data = {
            "id": comic_id,
            "title": title,
            "user_id": user_id,
            "pdf_url": pdf_url,
            "metadata": metadata.model_dump()
        }
        
        result = self.db_client.table("comics").insert(comic_data).execute()
        
        if result.data:
            return Comic(**result.data[0])
        else:
            raise Exception("Failed to save comic to database")
    
    def get_comic(self, comic_id: str) -> Optional[Comic]:
        """Get comic by ID"""
        result = self.db_client.table("comics").select("*").eq("id", comic_id).execute()
        
        if result.data:
            comic_data = result.data[0]
            # Parse metadata back to ComicMetadata
            if comic_data.get("metadata"):
                comic_data["metadata"] = ComicMetadata(**comic_data["metadata"])
            return Comic(**comic_data)
        return None
    
    def get_user_comics(self, user_id: str) -> List[Comic]:
        """Get all comics for a user"""
        result = self.db_client.table("comics").select("*").eq("user_id", user_id).execute()
        
        comics = []
        for comic_data in result.data:
            if comic_data.get("metadata"):
                comic_data["metadata"] = ComicMetadata(**comic_data["metadata"])
            comics.append(Comic(**comic_data))
        
        return comics
    
    def _upload_pdf_to_storage(self, file_path: str, comic_id: str) -> str:
        """Upload PDF file to Supabase storage"""
        try:
            # Read the PDF file
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            # Upload to Supabase storage
            storage_path = f"comics/{comic_id}.pdf"
            self.db_client.storage.from_("comics").upload(storage_path, file_data)
            
            # Get public URL
            url_response = self.db_client.storage.from_("comics").get_public_url(storage_path)
            return url_response
            
        except Exception as e:
            raise Exception(f"Failed to upload PDF: {str(e)}")


# Global comic service instance
comic_service = ComicService()