import logging
from typing import Any

from .request import DiscordRequester

logger = logging.getLogger("discord")


def get_discord_member(server_id: str, user_id: str) -> dict[str, Any] | None:
    """
    Gets a user's data through the discord API.

    If the user exists, a Member object is returned:
    https://discord.com/developers/docs/resources/guild#guild-member-object

    If the user does not exist, then `None` is returned
    """

    response = DiscordRequester.request(
        "/guilds/{guild_id}/members/{user_id}", guild_id=server_id, user_id=user_id
    )

    if response.status_code == 200:
        return response.json()
    else:
        return None


def add_user_to_server(
    server_id: str, user_id: str, access_token: str, roles: list[str] | None = None
) -> dict[str, Any] | None:
    """
    Joins a user to a discord server. This requires an OAuth access token to work.

    Args:
        server_id (str): The server to add the user to
        user_id (str): The id of the user to add
        access_token (str): The OAuth token from Discord
        roles (list[str]): A list of role ids to give the user on joining


    If the user is new, then the Member data is returned, otherwise None.
    """

    response = DiscordRequester.request(
        "/guilds/{guild_id}/members/{user_id}",
        method="PUT",
        json={"access_token": access_token, "roles": roles or []},
        guild_id=server_id,
        user_id=user_id,
    )

    if response.status_code == 201:
        # A new member  was created
        return response.json()
    elif response.status_code == 204:
        # The user was already in the server
        return None
    else:
        # Unknown code
        logger.warning(
            f"Invalid response code {response.status_code} when joining user `{user_id}` to server `{server_id}` with roles `{roles}`"
        )
        return None


def get_user_profile(user: dict[str, str]) -> str | None:
    """
    Get a user's profile picture from the user "object".

    Args:
        user (dict[str, str]): The user object to get the pfp of.


    If the user has a custom pfp, returns the full url, otherwise None.
    """

    user_id = user.get("id")
    avatar_hash = user.get("avatar")

    if not user_id or not avatar_hash:
        # The user doesn't exist or has the default discord pfp
        return None

    is_animated = avatar_hash.startswith("a_")
    extension = "gif" if is_animated else "png"

    return f"{DiscordRequester.DISCORD_CDN_BASE}/avatars/{user_id}/{avatar_hash}.{extension}"


def get_user_profile_from_id(user_id: str):
    """
    Get a user's profile picture from just the id.
    Using the function with the full user object is preferred if possible.

    Args:
        user_id (str): The id of the user to get the pfp of.


    If the user has a custom pfp, returns the full url.
    If the user has the default discord pfp or is not visible to
    the bot, return None.
    """

    response = DiscordRequester.request("/users/{user_id}", user_id=user_id)

    if response.status_code == 200:
        return get_user_profile(response.json())
    else:
        return None
