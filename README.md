# CHRIS Backend

## Installing Package Dependencies

You will need uv and bun installed to test this application.

- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [bun](https://bun.sh/docs/installation)

## Dev Setup

1. Copy `.env.example` to `.env` and `chris-frontend/.env.example` to `chris-frontend/.env` then modify the values within to use your configuration.

2. Run `docker compose -f docker-compose-dev.yml up -d keycloak db` then go to [localhost:8080](http://localhost:8080). Log in with `admin:admin`.

3. Create a new realm in Keycloak with the `chris-realm-export.json` export. Click into Chris Realm and modify the Client settings for the chris-backend client.

4. Modify redirect URL, root URL, and regenerate the client secret then copy the client secret to the `.env` file.

5. In Keycloak go into Identity Providers and paste your Discord client secret.

6. Keycloak is now fully configured. Run `docker compose -f docker-compose-dev.yml up -d --build web api`.

7. Your app should now be fully configured. Open [localhost:5173](http://localhost:5173) to get started.

8. You can use `docker compose down web && cd chris-frontend && bun run dev` for live reloading on the frontend after successful application startup.

## Managing the Application

- For Python: `uv run ruff format ./ && uv run isort --profile black ./ && uv run ruff check --fix ./`

- MyPy: `uv run mypy chris/ --config-file pyproject.toml`

- For everything else: `bun run prettier --write ./`
