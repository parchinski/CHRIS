import re

from pydantic import BaseModel, Field, validator


class TeamCreate(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=64, description="Team name (1-64 characters)"
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Team password (8-128 characters)",
    )

    @validator("name")
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Team name cannot be empty or just whitespace")
        if not re.match(r"^[a-zA-Z0-9\s\-_]+$", v):
            raise ValueError(
                "Team name can only contain letters, numbers, spaces, hyphens, and underscores"
            )
        return v.strip()

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class TeamJoin(BaseModel):
    name: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)


class TeamCheck(BaseModel):
    name: str
    exists: bool


class TeamMember(BaseModel):
    id: int
    username: str
    discord_id: str
    name: str


class TeamMembers(BaseModel):
    team_name: str
    members: list[TeamMember]
    created_by: str


class AdminTeam(BaseModel):
    id: int
    name: str
    created_by: str
    members: list[TeamMember]
