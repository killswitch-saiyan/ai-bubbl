import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer
from app.services.comic_service import comic_service
from app.schemas.comic import ComicUploadRequest, ComicUploadResponse, ComicResponse, ComicsListResponse

router = APIRouter(prefix="/comics", tags=["comics"])
security = HTTPBearer()


def get_current_user_id(token: str = Depends(security)) -> str:
    # For MVP, we'll use a simple user ID
    # In production, validate JWT token here
    return "00000000-0000-0000-0000-000000000001"


@router.post("/upload", response_model=ComicUploadResponse)
async def upload_comic(
    title: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload and process a comic PDF"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        # Process comic
        comic = comic_service.upload_comic(temp_file_path, title, user_id)
        
        return ComicUploadResponse(
            comic=comic,
            message="Comic uploaded and processed successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process comic: {str(e)}")
    
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)


@router.get("/{comic_id}", response_model=ComicResponse)
async def get_comic(
    comic_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific comic"""
    comic = comic_service.get_comic(comic_id)
    
    if not comic:
        raise HTTPException(status_code=404, detail="Comic not found")
    
    if comic.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return ComicResponse(comic=comic)


@router.get("/", response_model=ComicsListResponse)
async def get_user_comics(
    user_id: str = Depends(get_current_user_id)
):
    """Get all comics for the current user"""
    comics = comic_service.get_user_comics(user_id)
    
    return ComicsListResponse(comics=comics)