from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.models.comic import Comic, ComicMetadata


class ComicUploadRequest(BaseModel):
    title: str


class ComicUploadResponse(BaseModel):
    comic: Comic
    message: str


class ComicResponse(BaseModel):
    comic: Comic


class ComicsListResponse(BaseModel):
    comics: list[Comic]