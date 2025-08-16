from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel


class ComicPanel(BaseModel):
    panel_id: str
    order: int
    bubbles: List[Dict[str, Any]]


class ComicPage(BaseModel):
    page_number: int
    panels: List[ComicPanel]


class ComicMetadata(BaseModel):
    title: str
    characters: List[str]
    reading_direction: str = "ltr"  # "ltr" or "rtl"
    style: str = "western"  # "western" or "manga"
    pages: List[ComicPage]


class Comic(BaseModel):
    id: Optional[str] = None
    title: str
    user_id: str
    pdf_url: Optional[str] = None
    metadata: Optional[ComicMetadata] = None
    created_at: Optional[datetime] = None