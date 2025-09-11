"""Security utilities for password hashing and verification."""

import bcrypt


def hash_password(password: str) -> str:
    """Hash a password using bcrypt.

    Args:
        password: The plain text password to hash

    Returns:
        The hashed password as a string
    """
    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash.

    Args:
        password: The plain text password to verify
        hashed_password: The hashed password to verify against

    Returns:
        True if the password matches, False otherwise
    """
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
