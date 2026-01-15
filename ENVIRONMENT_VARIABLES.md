# Environment Variables

## Root Level (docker-compose.yml)
- `POSTGRES_PASSWORD` - PostgreSQL database password (REQUIRED for docker-compose)
- `KEYCLOAK_CLIENT_SECRET` - Keycloak client secret (defaults to empty string)
- `FINNHUB_TOKEN` - For accessing Finnhub API (REQUIRED)

## Backend (Incrementum.api)

### api_project/settings.py
- `DJANGO_SECRET_KEY` - Django secret key (defaults to dev key if not set)
- `DEBUG` - Debug mode (defaults to 'True')
- `CSRF_TRUSTED_ORIGINS` - CSRF trusted origins, comma-separated (defaults to 'http://localhost:5173')
- `CORS_ALLOWED_ORIGINS` - CORS allowed origins, comma-separated (defaults to 'http://localhost:5173')
- `ALLOWED_HOSTS` - Allowed hosts, comma-separated (defaults to 'api,localhost,127.0.0.1')
- `DATABASE_NAME` - Database name (defaults to 'Incr_DB')
- `DATABASE_USER` - Database user (defaults to 'Incr')
- `DATABASE_PASSWORD` - Database password (defaults to empty string)
- `DATABASE_HOST` - Database host (defaults to 'db')
- `DATABASE_PORT` - Database port (defaults to '5432')
- `FINNHUB_TOKEN` - For accessing Finnhub. no defaulting
### Incrementum/keycloak_service.py
- `KEYCLOAK_REALM_URL` - Keycloak realm URL (REQUIRED - no fallback)
- `KEYCLOAK_CLIENT_ID` - Keycloak client ID (defaults to 'incrementum-client')
- `KEYCLOAK_CLIENT_SECRET` - Keycloak client secret (defaults to empty string)

## Frontend (Incrementum.client)

### src/Context/FetchingHelper.ts
- `VITE_API_BASE_URL` - API base URL (defaults to 'http://localhost:8000')
- `VITE_DASH_BASE_URL` - Dash service base URL (defaults to 'http://localhost:8050')
