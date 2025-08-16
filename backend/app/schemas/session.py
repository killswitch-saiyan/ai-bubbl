from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.models.session import Session


class SessionCreateRequest(BaseModel):
    comic_id: str
    character_assignments: Optional[Dict[str, Any]] = None


class SessionCreateResponse(BaseModel):
    session: Session
    message: str


class SessionUpdateProgressRequest(BaseModel):
    current_page: int
    current_panel: int


class SessionUpdateCharactersRequest(BaseModel):
    character_assignments: Dict[str, Any]


class SessionResponse(BaseModel):
    session: Session


class SessionsListResponse(BaseModel):
    sessions: list[Session]