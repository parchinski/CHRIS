from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from chris.models.team import Team


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sub: str = Field(unique=True, index=True, max_length=255)
    username: str = Field(max_length=255)
    discord_id: str = Field(max_length=255, index=True)
    email: str = Field(max_length=255, index=True)
    name: str = Field(max_length=255)
    roles: list[str] = Field(default_factory=list, sa_column=Column(JSONB))
    team_name: Optional[str] = Field(default=None, index=True, max_length=255)
    availability: Optional[list[str]] = Field(
        default_factory=list, sa_column=Column(JSONB)
    )
    shirt_size: Optional[str] = Field(default=None, max_length=10)
    dietary_restrictions: Optional[str] = Field(default=None, sa_column=Column(Text))
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    can_take_photos: bool = Field(default=True)

    # Relationship to teams created by this user
    created_teams: list["Team"] = Relationship(back_populates="created_by")
