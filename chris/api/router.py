from fastapi import APIRouter

from chris.api.endpoints import auth, discord, staff, teams, users

router = APIRouter()

router.include_router(auth.router)
router.include_router(discord.router)
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(teams.router, prefix="/teams", tags=["Teams"])
router.include_router(staff.router, prefix="/staff", tags=["Staff"])
