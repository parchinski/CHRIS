from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from chris.auth.schemas import UserInfo
from chris.auth.services import AuthService
from chris.core.config import settings
from chris.database.db import get_async_session
from chris.models.user import User
from chris.schemas.user import UserUpdate


async def get_or_create_user(session: AsyncSession, user_info: UserInfo) -> User:
    """
    Gets a user from the database based on their Keycloak 'sub' (subject) ID.
    If the user exists, it only updates fields that should be synced from auth provider.
    If the user does not exist, it creates a new one.
    This preserves user-editable fields while keeping auth data in sync.
    """
    # Select the user based on the immutable Keycloak subject ID.
    result = await session.execute(select(User).where(User.sub == user_info.sub))
    user = result.scalar_one_or_none()

    if user:
        # Only update fields that should always sync from auth provider
        user.username = user_info.username
        user.discord_id = user_info.discord_id
        user.roles = user_info.roles or []
        # Do NOT overwrite email and name - these can be edited by users
        # and should persist independently of auth provider data
    else:
        # For new users, initialize with auth provider data
        user = User(
            sub=user_info.sub,
            username=user_info.username,
            discord_id=user_info.discord_id,
            email=user_info.email,
            name=user_info.name,
            roles=user_info.roles or [],
        )

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_current_user(
    request: Request, session: AsyncSession = Depends(get_async_session)
) -> User:
    token = request.cookies.get(settings.auth_cookie_name)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated (cookie missing)",
            headers={"WWW-Authenticate": "Cookie"},
        )

    try:
        user_info = AuthService.verify_token(token)
        db_user = await get_or_create_user(session, user_info)

        return db_user
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=f"Invalid authentication cookie: {e.detail}",
            headers={"WWW-Authenticate": "Cookie"},
        ) from e


async def update_user(
    session: AsyncSession, db_user: User, user_update: UserUpdate
) -> User:
    """
    Updates a user's information in the database.
    """
    update_data = user_update.model_dump(exclude_unset=True)

    # Normalize team names across the board
    if "team_name" in update_data:
        team_val = update_data["team_name"]
        if team_val is not None:
            normalized = team_val.strip()
            update_data["team_name"] = normalized.lower() if normalized else None

    for key, value in update_data.items():
        setattr(db_user, key, value)

    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)

    return db_user
