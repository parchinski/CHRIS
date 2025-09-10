import traceback
from typing import Dict

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from chris.api.controllers.auth import AuthController
from chris.auth.services import AuthService
from chris.core.config import get_openid, settings
from chris.database.db import get_async_session
from chris.services.discord import get_discord_member
from chris.services.user import get_or_create_user

router = APIRouter()
keycloak_openid_client = get_openid()


@router.get("/health", tags=["Authentication"])
async def health_check() -> Dict[str, str]:
    """
    A simple health check endpoint.
    """
    return {"status": "ok"}


@router.get("/login", response_class=RedirectResponse, tags=["Authentication"])
async def login_redirect_to_keycloak(request: Request) -> RedirectResponse:
    """
    Redirects the user to Keycloak for authentication.
    """
    redirect_uri = str(request.url_for("handle_keycloak_callback"))
    auth_url = keycloak_openid_client.auth_url(
        redirect_uri=redirect_uri, scope="openid profile email roles"
    )
    return RedirectResponse(auth_url + "&kc_idp_hint=discord")


@router.get("/callback", tags=["Authentication"], name="handle_keycloak_callback")
async def handle_keycloak_callback(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_async_session),
) -> RedirectResponse:
    """
    Handles the callback from Keycloak after user authentication.
    """
    # Check for Keycloak errors first
    error = request.query_params.get("error")
    if error:
        error_description = request.query_params.get(
            "error_description", "Unknown error"
        )
        error_redirect_url = f"{settings.frontend_base_url}/auth-error?message={error}&description={error_description}"
        return RedirectResponse(url=error_redirect_url)

    # Then get authorization code from the request
    authorization_code = request.query_params.get("code")
    if not authorization_code:
        error_redirect_url = (
            f"{settings.frontend_base_url}/auth-error?message=MissingAuthorizationCode"
        )
        return RedirectResponse(url=error_redirect_url)

    try:
        # Authenticate with Keycloak, get JWT token and user info
        chris_access_token, expires_in_seconds, user_info = (
            AuthService.authenticate_user(str(authorization_code), request)
        )

        # Get or create the user in the database after successful authentication
        db_user = await get_or_create_user(session=session, user_info=user_info)

        # Check if we need to join them to the server
        member = get_discord_member(settings.discord_server_id, db_user.discord_id)

        if member is not None:
            # Set the JWT as an HttpOnly cookie and redirect to the frontend
            return AuthController.login(
                chris_access_token, expires_in_seconds, response
            )

        else:
            # Set the cookie and get them to join the server
            return AuthController.login(
                chris_access_token,
                expires_in_seconds,
                response,
                redirect_url=str(request.url_for("discord_oauth")),
            )

    except Exception as e:
        # Log the error and redirect to error page
        print(f"Error in callback handler: {e}")

        traceback.print_exc()
        error_redirect_url = f"{settings.frontend_base_url}/auth-error?message=AuthenticationFailed&description={str(e)}"
        return RedirectResponse(url=error_redirect_url)


@router.get("/logout", tags=["Authentication"], name="logout_user")
async def logout_user(response: Response) -> RedirectResponse:
    """
    Logs the user out by clearing the authentication cookie.
    """
    return AuthController.logout(response)
