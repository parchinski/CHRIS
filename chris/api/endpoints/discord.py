from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from requests_oauthlib import OAuth2Session

from chris.core.config import settings
from chris.models.user import User
from chris.services.discord import add_user_to_server
from chris.services.user import get_current_user

router = APIRouter()


@router.get("/discord", name="discord_oauth")
def get_discord_token(
    request: Request, user: User = Depends(get_current_user)
) -> RedirectResponse:
    oauth = OAuth2Session(
        client_id=settings.discord_client_id,
        redirect_uri=f"{settings.api_base_url}/discord/callback",
        scope="identify email guilds guilds.join",  # https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
    )

    auth_url, state = oauth.authorization_url("https://discord.com/oauth2/authorize")

    return RedirectResponse(auth_url)


@router.get("/discord/callback", name="handle_discord_callback")
def join_server(
    request: Request,
    code: str | None = None,
    user: User = Depends(get_current_user),
) -> RedirectResponse:
    if not code:
        raise HTTPException(status_code=500, detail="The Discord OAuth did not work!")

    # Finish the OAuth path
    oauth = OAuth2Session(
        client_id=settings.discord_client_id,
        scope="identify email guilds guilds.join",
        redirect_uri=f"{settings.api_base_url}/discord/callback",
    )

    token = oauth.fetch_token(
        "https://discord.com/api/oauth2/token",
        auth=(settings.discord_client_id, settings.discord_client_secret),
        code=code,
    )

    # Ask discord to join the server
    add_user_to_server(
        server_id=settings.discord_server_id,
        user_id=user.discord_id,
        access_token=token["access_token"],
    )

    return RedirectResponse(url=settings.frontend_base_url)
