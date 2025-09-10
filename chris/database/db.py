from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlmodel import create_engine

# The database URL is created using the settings from the config file.
from chris.core.config import settings


# The database URL is created using the settings from the config file.
def build_db_url() -> URL:
    """
    Build a SQLAlchemy URL object for PostgreSQL with asyncpg driver.
    - Escapes the password automatically.
    - Keeps the port optional.
    - Optimized for PostgreSQL.
    """
    return URL.create(
        drivername="postgresql+asyncpg",
        username=settings.db_user,
        password=settings.db_password,
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
    )


def build_sync_db_url() -> URL:
    """
    Build a synchronous SQLAlchemy URL for table creation.
    """
    return URL.create(
        drivername="postgresql+psycopg2",
        username=settings.db_user,
        password=settings.db_password,
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
    )


# Async engine for runtime operations
async_engine = create_async_engine(
    build_db_url(), echo=True, pool_size=20, max_overflow=0
)

# Sync engine for table creation
sync_engine = create_engine(build_sync_db_url(), echo=True)


async def get_async_session():
    """
    Dependency that provides an async database session for each request.
    It ensures that the session is always closed after the request is finished.
    """
    async with AsyncSession(async_engine) as session:
        yield session
