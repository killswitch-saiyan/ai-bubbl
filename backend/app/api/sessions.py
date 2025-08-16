from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from app.services.session_service import session_service
from app.schemas.session import (
    SessionCreateRequest, SessionCreateResponse, SessionUpdateProgressRequest,
    SessionUpdateCharactersRequest, SessionResponse, SessionsListResponse
)

router = APIRouter(prefix="/sessions", tags=["sessions"])
security = HTTPBearer()


def get_current_user_id(token: str = Depends(security)) -> str:
    # For MVP, we'll use a simple user ID
    # In production, validate JWT token here
    return "00000000-0000-0000-0000-000000000001"


@router.post("/", response_model=SessionCreateResponse)
async def create_session(
    request: SessionCreateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new reading session"""
    try:
        session = session_service.create_session(
            user_id=user_id,
            comic_id=request.comic_id,
            character_assignments=request.character_assignments
        )
        
        return SessionCreateResponse(
            session=session,
            message="Session created successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific session"""
    session = session_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return SessionResponse(session=session)


@router.put("/{session_id}/progress", response_model=SessionResponse)
async def update_session_progress(
    session_id: str,
    request: SessionUpdateProgressRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update session reading progress"""
    session = session_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        updated_session = session_service.update_session_progress(
            session_id, request.current_page, request.current_panel
        )
        return SessionResponse(session=updated_session)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")


@router.put("/{session_id}/characters", response_model=SessionResponse)
async def update_character_assignments(
    session_id: str,
    request: SessionUpdateCharactersRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update character assignments for session"""
    session = session_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        updated_session = session_service.update_character_assignments(
            session_id, request.character_assignments
        )
        return SessionResponse(session=updated_session)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update characters: {str(e)}")


@router.get("/", response_model=SessionsListResponse)
async def get_user_sessions(
    user_id: str = Depends(get_current_user_id)
):
    """Get all sessions for the current user"""
    sessions = session_service.get_user_sessions(user_id)
    
    return SessionsListResponse(sessions=sessions)