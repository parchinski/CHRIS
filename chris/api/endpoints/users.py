from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from chris.api.controllers.auth import AuthController
from chris.database.db import get_async_session
from chris.models.user import User
from chris.schemas.user import UserUpdate
from chris.services.discord import get_user_profile_from_id
from chris.services.user import get_current_user, update_user
from chris.types import SHIRT_SIZES

router = APIRouter()


@router.get("/get_user", response_model=User, tags=["User"])
async def protected_resource(current_user: User = Depends(get_current_user)) -> User:
    """
    Protected endpoint that requires a valid CHRIS JWT.
    """
    return current_user


@router.get("/discord_profile")
def get_discord_profile(
    current_user: User = Depends(get_current_user),
) -> dict[str, str | None]:
    return {"url": get_user_profile_from_id(current_user.discord_id)}


@router.patch("/edit_user", response_model=User)
async def update_current_user(
    user_in: UserUpdate,
    *,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Update current user.
    """
    db_user = current_user
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.team_name and len(user_in.team_name) > 64:
        raise HTTPException(
            status_code=400, detail="Team name cannot exceed 64 characters."
        )

    # Team capacity validation
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

    if user_in.shirt_size not in SHIRT_SIZES:
        raise HTTPException(status_code=400, detail="Invalid t-shirt size.")

    if user_in.dietary_restrictions and len(user_in.dietary_restrictions) > 1024:
        raise HTTPException(
            status_code=400, detail="Dietary restrictions exceed 1024 characters."
        )

    if user_in.notes and len(user_in.notes) > 1024:
        raise HTTPException(status_code=400, detail="Notes exceed 1024 characters.")

    return await update_user(session=session, db_user=db_user, user_update=user_in)


@router.delete("/delete_user", status_code=204, tags=["User"])
async def delete_current_user(
    *,
    response: Response,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
) -> None:
    db_user = current_user
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.delete(db_user)
    await session.commit()
    AuthController.logout_on_user_delete(response)
