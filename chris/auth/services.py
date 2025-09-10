from datetime import datetime, timedelta, timezone
from typing import cast

from fastapi import HTTPException, Request, status
from jose import JWTError, jwt
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakPostError

from chris.auth.schemas import UserInfo
from chris.core.config import keycloak_openid, settings


class AuthService:
    @staticmethod
    def authenticate_user(keycode: str, request: Request) -> tuple[str, int, UserInfo]:
        """
        1. Exchange authorization code for Keycloak token.
        2. Fetch user info from Keycloak.
        3. Create CHRIS JWT token.
        4. Return tuple of (chris_jwt_token, expires_in_seconds, user_info).
        """
        try:
            # Exchange authorization code for Keycloak token
            keycloak_token_response = keycloak_openid.token(
                grant_type="authorization_code",
                code=keycode,
                redirect_uri=str(request.url_for("handle_keycloak_callback")),
                scope="openid profile email roles",
            )
            keycloak_access_token = keycloak_token_response["access_token"]

            # Fetch user info from Keycloak using the Keycloak access token
            kc_user_info = keycloak_openid.userinfo(keycloak_access_token)
            if not kc_user_info:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to fetch user info from Keycloak.",
                )

            # Check that we have the discord id
            # Keycloak should provice it as long as the user authed with discord
            if (
                not kc_user_info.get("discord_id")
                or kc_user_info.get("discord_id") == "0"
            ):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="User did not authenticate with Discord.",
                )

            # Generate a CHRIS JWT
            jwt_expiration_delta = timedelta(hours=settings.jwt_expiration_hours)
            expires_at = datetime.now(timezone.utc) + jwt_expiration_delta

            user_roles = kc_user_info.get("roles", [])

            if "groups" in kc_user_info:
                user_roles.extend(kc_user_info.get("groups", []))

            chris_jwt_claims = {
                "sub": kc_user_info.get("sub"),  # Subject - Keycloak user ID
                "username": kc_user_info.get("preferred_username"),
                "discord_id": kc_user_info.get("discord_id"),
                "email": kc_user_info.get("email"),
                "name": kc_user_info.get("name"),
                "roles": list(set(user_roles)),
                "exp": expires_at,
                "iat": datetime.now(timezone.utc),
                "iss": "chris-backend",
            }

            # Remove None values from claims to keep JWT clean
            chris_jwt_claims = {
                k: v for k, v in chris_jwt_claims.items() if v is not None
            }

            # Create CHRIS JWT token
            encoded_chris_jwt = jwt.encode(
                chris_jwt_claims,
                settings.jwt_secret_key,
                algorithm=settings.jwt_algorithm,
            )

            # Create UserInfo object and return both token and user info
            user_info = UserInfo(
                sub=cast(str, chris_jwt_claims["sub"]),
                username=cast(str, chris_jwt_claims["username"]),
                discord_id=cast(str, chris_jwt_claims["discord_id"]),
                email=cast(str, chris_jwt_claims.get("email")),
                name=cast(str, chris_jwt_claims.get("name")),
                roles=cast(list[str], chris_jwt_claims.get("roles", [])),
            )
            expires_in_seconds = int(jwt_expiration_delta.total_seconds())

            return encoded_chris_jwt, expires_in_seconds, user_info

        except KeycloakAuthenticationError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Keycloak authentication error: {exc}",
            ) from exc
        except KeycloakPostError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Keycloak post error (e.g., invalid grant): {exc}",
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An unexpected error occurred during authentication: {exc}",
            ) from exc

    @staticmethod
    def create_chris_jwt(sub: str) -> tuple[str, int]:
        """
        Create a CHRIS JWT for a given user's Keycloak sub.
        """
        jwt_expiration_delta = timedelta(hours=settings.jwt_expiration_hours)
        expires_at = datetime.now(timezone.utc) + jwt_expiration_delta

        chris_jwt_claims = {
            "sub": sub,
            "exp": expires_at,
            "iat": datetime.now(timezone.utc),
            "iss": "chris-backend",
        }

        encoded_chris_jwt = jwt.encode(
            chris_jwt_claims,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )

        return encoded_chris_jwt, int(jwt_expiration_delta.total_seconds())

    @staticmethod
    def verify_token(token: str) -> UserInfo:
        """
        Verify the CHRIS JWT and return user information.
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
                options={"verify_aud": False},  # No specific audience for now
            )

            # Basic check for required fields from the CHRIS JWT
            username: str | None = payload.get("username")
            sub: str | None = payload.get("sub")
            discord_id: str | None = payload.get("discord_id")

            if username is None or sub is None or discord_id is None:
                raise credentials_exception

            # Construct UserInfo from the CHRIS JWT payload
            return UserInfo(
                sub=sub,
                username=username,
                discord_id=discord_id,
                email=payload.get("email"),
                name=payload.get("name"),
                roles=payload.get("roles", []),
            )
        except JWTError as exc:
            raise credentials_exception from exc
