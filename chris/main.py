from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from chris.api.router import router as api_router
from chris.database.db import sync_engine


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(sync_engine)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # on startup
    create_db_and_tables()
    yield
    # on shutdown - can add cleanup logic here


app = FastAPI(
    lifespan=lifespan,
    title="CHRIS Backend with Keycloak, Discord Roles & Cookie Auth",
    description="Handles OIDC authentication, issues CHRIS JWTs via HttpOnly cookies, and supports Discord role syncing for a Vite frontend.",
    version="0.3.0",
    root_path="/api",
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sso-beta-hr.plinko.horse",
        "https://beta-hr.plinko.horse",
        "http://localhost:8080",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
