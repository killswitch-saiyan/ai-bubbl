from supabase import create_client, Client
from app.core.config import settings
from typing import Optional


class Database:
    def __init__(self):
        self._client: Optional[Client] = None
    
    def get_client(self) -> Client:
        if self._client is None:
            self._client = create_client(
                settings.supabase_url,
                settings.supabase_service_role_key
            )
        return self._client


# Global database instance - client will be created on first use
db = Database()