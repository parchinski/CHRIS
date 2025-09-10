from typing import List, Optional

from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str  # CHRIS JWT
    token_type: str = "Bearer"
    expires_in: int


class UserInfo(BaseModel):
    sub: str
    username: str
    discord_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    roles: List[str] = []


class AuthRedirectResponse(
    BaseModel
):  # This model might need re-evaluation based on final flow
    success: bool
    access_token: str
    user_info: UserInfo
    expires_in: Optional[int] = None
