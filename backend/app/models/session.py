from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class Session(BaseModel):
    id: Optional[str] = None
    user_id: str
    comic_id: str
    current_panel: int = 1
    current_page: int = 1
    character_assignments: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None