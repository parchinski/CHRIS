FROM ghcr.io/astral-sh/uv:debian AS deps

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_CACHE_DIR=/root/.cache/uv

COPY pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache \
    uv sync --no-dev --compile-bytecode

FROM deps AS runtime
COPY ./chris ./chris
EXPOSE 8000

CMD ["uv", "run", "--", "uvicorn", "--no-dev", "chris.main:app", "--host", "0.0.0.0", "--port", "8000"]
