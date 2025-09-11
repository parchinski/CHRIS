from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    # Imported only for type checking side effects of TypeScript
    from .user import User


class Team(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True, max_length=64)
    password_hash: str = Field(max_length=255)  # Store hashed password
    created_by_id: Optional[int] = Field(
        default=None, foreign_key="user.id", index=True
    )
    created_by: Optional["User"] = Relationship(back_populates="created_teams")
