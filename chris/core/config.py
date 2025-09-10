from typing import Optional

from keycloak import KeycloakOpenID
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

    frontend_base_url: str = Field(..., env="FRONTEND_BASE_URL")  # type: ignore[call-overload]
    api_base_url: str = Field(..., env="API_BASE_URL")  # type: ignore[call-overload]

    # Keycloak env
    keycloak_internal_url: str = Field(..., env="KEYCLOAK_INTERNAL_URL")  # type: ignore[call-overload]
    keycloak_realm: str = Field(..., env="KEYCLOAK_REALM")  # type: ignore[call-overload]
    keycloak_client_id: str = Field(..., env="KEYCLOAK_CLIENT_ID")  # type: ignore[call-overload]
    keycloak_client_secret: str = Field(..., env="KEYCLOAK_CLIENT_SECRET")  # type: ignore[call-overload]

    # Database env
    db_host: str = Field(..., env="DB_HOST")  # type: ignore[call-overload]
    db_user: str = Field(..., env="DB_USER")  # type: ignore[call-overload]
    db_password: str = Field(..., env="DB_PASSWORD")  # type: ignore[call-overload]
    db_name: str = Field(..., env="DB_NAME")  # type: ignore[call-overload]
    db_port: int = Field(..., env="DB_PORT")  # type: ignore[call-overload]

    # JWT env
    jwt_secret_key: str = Field(..., env="JWT_SECRET_KEY")  # type: ignore[call-overload]
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")  # type: ignore[call-overload]
    jwt_expiration_hours: int = Field(default=24, env="JWT_EXPIRATION_HOURS")  # type: ignore[call-overload]

    # Cookie env
    auth_cookie_name: str = Field(default="chris_auth_token", env="AUTH_COOKIE_NAME")  # type: ignore[call-overload]
    auth_cookie_secure: bool = Field(default=True, env="AUTH_COOKIE_SECURE")  # type: ignore[call-overload]
    auth_cookie_httponly: bool = Field(default=False, env="AUTH_COOKIE_HTTPONLY")  # type: ignore[call-overload]
    auth_cookie_samesite: str = "lax"
    auth_cookie_domain: Optional[str] = None
    auth_cookie_path: str = "/"

    # Discord settings
    discord_client_id: str = Field(..., env="DISCORD_CLIENT_ID")  # type: ignore[call-overload]
    discord_client_secret: str = Field(..., env="DISCORD_CLIENT_SECRET")  # type: ignore[call-overload]
    discord_bot_token: str = Field(..., env="DISCORD_BOT_TOKEN")  # type: ignore[call-overload]
    discord_server_id: str = Field(
        default="1150133792040824873",
        env="DISCORD_SERVER_ID",  # type: ignore[call-overload]
    )


settings = Settings()  # type: ignore[call-arg]

keycloak_openid = KeycloakOpenID(
    server_url=settings.keycloak_internal_url,
    realm_name=settings.keycloak_realm,
    client_id=settings.keycloak_client_id,
    client_secret_key=settings.keycloak_client_secret,
    verify=False,
)


def get_openid_config() -> dict:
    return keycloak_openid.well_known()


def get_openid() -> KeycloakOpenID:
    return keycloak_openid
