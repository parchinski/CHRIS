from typing import Literal, cast

from fastapi import HTTPException, Response, status
from fastapi.responses import RedirectResponse

from chris.core.config import settings


class AuthController:
    """
    Controller for handling authentication logic with HttpOnly cookies.
    """

    @staticmethod
    def login(
        chris_access_token: str,
        expires_in_seconds: int,
        response: Response,
        redirect_url: str = settings.frontend_base_url,
    ) -> RedirectResponse:
        """
        Sets the CHRIS JWT as an HttpOnly cookie and redirects to the frontend application.

        Args:
            chris_access_token (str): The CHRIS JWT token.
            expires_in_seconds (int): Token expiration time in seconds.
            response (Response): The FastAPI response object (injected by FastAPI).
            redirect_url (str): The path to redirect to after

        Returns:
            RedirectResponse: Redirects the user to the frontend base URL.
        """
        if not chris_access_token:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to obtain CHRIS access token during login.",
            )

        redirect_response = RedirectResponse(url=redirect_url)
        redirect_response.set_cookie(
            key=settings.auth_cookie_name,
            value=chris_access_token,
            max_age=expires_in_seconds,
            httponly=settings.auth_cookie_httponly,
            secure=settings.auth_cookie_secure,
            samesite=cast(
                Literal["lax", "strict", "none"], settings.auth_cookie_samesite
            ),
            domain=settings.auth_cookie_domain,
            path=settings.auth_cookie_path,
        )

        return redirect_response

    @staticmethod
    def logout(response: Response) -> RedirectResponse:
        """
        Clears the authentication cookie and redirects to the frontend.

        Args:
            response (Response): The FastAPI response object.

        Returns:
            RedirectResponse: Redirects the user to the frontend base URL.
        """
        redirect_url = settings.frontend_base_url
        redirect_response = RedirectResponse(
            url=redirect_url, status_code=status.HTTP_302_FOUND
        )
        redirect_response.delete_cookie(
            key=settings.auth_cookie_name,
            httponly=settings.auth_cookie_httponly,
            secure=settings.auth_cookie_secure,
            samesite=cast(
                Literal["lax", "strict", "none"], settings.auth_cookie_samesite
            ),
            domain=settings.auth_cookie_domain,
            path=settings.auth_cookie_path,
        )

        return redirect_response

    @staticmethod
    def logout_on_user_delete(response: Response) -> None:
        """
        Handles logout specifically for user deletion scenarios.
        Clears the authentication cookie.

        Args:
            response (Response): The FastAPI response object.
        """
        response.delete_cookie(
            key=settings.auth_cookie_name,
            httponly=settings.auth_cookie_httponly,
            secure=settings.auth_cookie_secure,
            samesite=cast(
                Literal["lax", "strict", "none"], settings.auth_cookie_samesite
            ),
            domain=settings.auth_cookie_domain,
            path=settings.auth_cookie_path,
        )
