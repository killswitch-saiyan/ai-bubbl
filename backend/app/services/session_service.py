import uuid
from typing import Optional, Dict, Any
from app.core.database import db
from app.models.session import Session


class SessionService:
    def __init__(self):
        self.db_client = db.get_client()
    
    def create_session(self, user_id: str, comic_id: str, character_assignments: Dict[str, Any] = None) -> Session:
        """Create a new reading session"""
        
        session_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "comic_id": comic_id,
            "current_panel": 1,
            "current_page": 1,
            "character_assignments": character_assignments or {}
        }
        
        result = self.db_client.table("sessions").insert(session_data).execute()
        
        if result.data:
            return Session(**result.data[0])
        else:
            raise Exception("Failed to create session")
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """Get session by ID"""
        result = self.db_client.table("sessions").select("*").eq("id", session_id).execute()
        
        if result.data:
            return Session(**result.data[0])
        return None
    
    def update_session_progress(self, session_id: str, current_page: int, current_panel: int) -> Session:
        """Update session reading progress"""
        update_data = {
            "current_page": current_page,
            "current_panel": current_panel
        }
        
        result = self.db_client.table("sessions").update(update_data).eq("id", session_id).execute()
        
        if result.data:
            return Session(**result.data[0])
        else:
            raise Exception("Failed to update session")
    
    def update_character_assignments(self, session_id: str, character_assignments: Dict[str, Any]) -> Session:
        """Update character assignments for session"""
        update_data = {
            "character_assignments": character_assignments
        }
        
        result = self.db_client.table("sessions").update(update_data).eq("id", session_id).execute()
        
        if result.data:
            return Session(**result.data[0])
        else:
            raise Exception("Failed to update character assignments")
    
    def get_user_sessions(self, user_id: str) -> list[Session]:
        """Get all sessions for a user"""
        result = self.db_client.table("sessions").select("*").eq("user_id", user_id).execute()
        
        return [Session(**session_data) for session_data in result.data]


# Global session service instance
session_service = SessionService()