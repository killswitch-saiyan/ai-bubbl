from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class User(BaseModel):
    id: Optional[str] = None
    name: str
    email: Optional[str] = None
    created_at: Optional[datetime] = None