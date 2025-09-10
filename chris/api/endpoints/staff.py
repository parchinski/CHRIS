from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from chris.database.db import get_async_session
from chris.models.user import User
from chris.schemas.user import UserUpdate
from chris.services.discord import get_user_profile_from_id
from chris.services.user import get_current_user, update_user
from chris.types import SHIRT_SIZES


async def user_is_staff(user: User = Depends(get_current_user)) -> None:
    if "staff" not in (user.roles or []):
        raise HTTPException(status_code=403, detail="Staff access required")


router = APIRouter(dependencies=[Depends(user_is_staff)])


@router.get("/users", response_model=List[User], tags=["Staff"])
async def admin_list_users(
    *,
    session: AsyncSession = Depends(get_async_session),
    q: Optional[str] = Query(None, description="Search text"),
    limit: int = Query(500, ge=1, le=5000),
    offset: int = Query(0, ge=0),
) -> List[User]:
    query = select(User)
    if q:
        like = f"%{q}%"
        conditions = [
            User.username.ilike(like),  # type: ignore[attr-defined]
            User.email.ilike(like),  # type: ignore[attr-defined]
            User.name.ilike(like),  # type: ignore[attr-defined]
            User.discord_id.ilike(like),  # type: ignore[attr-defined]
        ]
        # Handle nullable team_name field
        if User.team_name is not None:
            conditions.append(User.team_name.ilike(like))  # type: ignore[attr-defined,union-attr]
        query = query.where(or_(*conditions))
    query = query.offset(offset).limit(limit)
    result = await session.execute(query)
    return list(result.scalars().all())


@router.patch("/users/{user_id}", response_model=User, tags=["Staff"])
async def admin_update_user(
    user_id: int,
    user_in: UserUpdate,
    *,
    session: AsyncSession = Depends(get_async_session),
) -> User:
    db_user = await session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.team_name and len(user_in.team_name) > 64:
        raise HTTPException(
            status_code=400, detail="Team name cannot exceed 64 characters."
        )

    if user_in.team_name and user_in.team_name != db_user.team_name:
        query = select(func.count()).where(User.team_name == user_in.team_name)
        result = await session.execute(query)
        team_count = result.scalar_one()
        if team_count >= 4:
            raise HTTPException(
                status_code=418, detail=f"Team '{user_in.team_name}' is full."
            )

    if user_in.availability and len(user_in.availability) < 1:
        raise HTTPException(status_code=400, detail="Availability cannot be empty")

    if user_in.shirt_size and user_in.shirt_size not in SHIRT_SIZES:
        raise HTTPException(status_code=400, detail="Invalid t-shirt size.")

    if user_in.dietary_restrictions and len(user_in.dietary_restrictions) > 1024:
        raise HTTPException(
            status_code=400, detail="Dietary restrictions exceed 1024 characters."
        )

    if user_in.notes and len(user_in.notes) > 1024:
        raise HTTPException(status_code=400, detail="Notes exceed 1024 characters.")

    return await update_user(session=session, db_user=db_user, user_update=user_in)


@router.delete("/users/{user_id}", status_code=204, tags=["Staff"])
async def admin_delete_user(
    user_id: int,
    *,
    session: AsyncSession = Depends(get_async_session),
) -> None:
    db_user = await session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.delete(db_user)
    await session.commit()


@router.get("/users/{discord_id}/discord_profile")
def get_staff_discord_profile(
    discord_id: str, current_user: User = Depends(get_current_user)
) -> Dict[str, str | None]:
    """
    Get a user's discord profile picture by their discord ID.
    This is an admin-only endpoint.
    """
    url = get_user_profile_from_id(discord_id)
    return {"url": url}
