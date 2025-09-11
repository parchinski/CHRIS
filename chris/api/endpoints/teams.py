from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from chris.database.db import get_async_session
from chris.models.team import Team
from chris.models.user import User
from chris.schemas.team import (
    TeamCheck,
    TeamCreate,
    TeamJoin,
    TeamMember,
    TeamMembers,
)
from chris.services.user import get_current_user
from chris.utils.security import hash_password, verify_password

router = APIRouter()


@router.get("/check/{team_name}", response_model=TeamCheck)
async def check_team_exists(
    team_name: str,
    *,
    session: AsyncSession = Depends(get_async_session),
) -> TeamCheck:
    """Check if a team exists."""
    query = select(Team).where(func.lower(Team.name) == team_name.lower())
    result = await session.execute(query)
    team = result.scalar_one_or_none()

    return TeamCheck(name=team_name, exists=team is not None)


@router.post("/create")
async def create_team(
    team_data: TeamCreate,
    *,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Create a new team with password protection."""
    if current_user.team_name:
        raise HTTPException(status_code=400, detail="You are already in a team")

    # Check if team exists
    desired_name = team_data.name.strip()
    existing_query = select(Team).where(func.lower(Team.name) == desired_name.lower())
    existing_result = await session.execute(existing_query)
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Team already exists")

    # Hash the password before storing
    password_hash = hash_password(team_data.password)

    team = Team(
        name=desired_name.lower(),
        password_hash=password_hash,
        created_by_id=current_user.id,
    )
    session.add(team)

    current_user.team_name = team.name
    session.add(current_user)

    await session.commit()
    await session.refresh(team)

    return {"message": "Team created successfully", "team_name": team.name}


@router.post("/join")
async def join_team(
    team_data: TeamJoin,
    *,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Join an existing team with password."""
    if current_user.team_name:
        raise HTTPException(status_code=400, detail="You are already in a team")

    # Get team and member count
    desired_name = team_data.name.strip()
    team_query = select(Team).where(func.lower(Team.name) == desired_name.lower())
    team_result = await session.execute(team_query)
    team = team_result.scalar_one_or_none()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Verify password using bcrypt
    if not verify_password(team_data.password, team.password_hash):
        raise HTTPException(status_code=401, detail="Invalid team password")

    # Check member count
    member_count_query = select(func.count()).where(
        func.lower(User.team_name) == team.name.lower()
    )
    member_count = (await session.execute(member_count_query)).scalar_one()

    if member_count >= 4:
        raise HTTPException(status_code=409, detail=f"Team '{team.name}' is full")

    current_user.team_name = team.name
    session.add(current_user)
    await session.commit()

    return {"message": "Joined team successfully", "team_name": team.name}


@router.get("/members/{team_name}", response_model=TeamMembers)
async def get_team_members(
    team_name: str,
    *,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
) -> TeamMembers:
    """Get team members with Discord info."""
    if (
        not current_user.team_name
        or current_user.team_name.lower() != team_name.lower()
    ):
        raise HTTPException(
            status_code=403, detail="Access denied: not a member of this team"
        )

    query = (
        select(Team, User)
        .join(User, func.lower(User.team_name) == func.lower(Team.name))
        .where(func.lower(Team.name) == team_name.lower())
    )
    result = await session.execute(query)
    team_members_data = result.all()

    if not team_members_data:
        raise HTTPException(status_code=404, detail="Team not found")

    # Extract team info from first result
    team = team_members_data[0][0]

    # Get creator information
    creator_query = select(User).where(User.id == team.created_by_id)
    creator_result = await session.execute(creator_query)
    creator = creator_result.scalar_one_or_none()
    created_by_discord_id = creator.discord_id if creator else "Unknown"

    team_members = []
    for _, member in team_members_data:
        if member.id is not None:
            team_members.append(
                TeamMember(
                    id=member.id,
                    username=member.username,
                    discord_id=member.discord_id,
                    name=member.name or member.username,
                )
            )

    return TeamMembers(
        team_name=team.name, members=team_members, created_by=created_by_discord_id
    )


@router.post("/leave")
async def leave_team(
    *,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Leave the current team."""
    team_name = current_user.team_name
    if not team_name:
        raise HTTPException(status_code=400, detail="You are not in a team")

    team_query = select(Team).where(func.lower(Team.name) == team_name.lower())
    team_result = await session.execute(team_query)
    team = team_result.scalar_one_or_none()

    # Check if user is the team leader
    if team and team.created_by_id == current_user.id:
        # Check if there are other team members to transfer leadership to
        other_members_query = select(User).where(
            func.lower(User.team_name) == team_name.lower(),
            User.id != current_user.id,
        )
        other_members_result = await session.execute(other_members_query)
        other_members = other_members_result.scalars().all()

        # Transfer leadership or delete the team if no other members
        if other_members:
            new_leader = other_members[0]
            team.created_by_id = new_leader.id
            session.add(team)
        else:
            await session.delete(team)

    current_user.team_name = None
    session.add(current_user)
    await session.commit()

    return {"message": "You have left the team"}
