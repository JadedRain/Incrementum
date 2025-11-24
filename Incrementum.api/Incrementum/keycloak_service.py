from keycloak import KeycloakOpenID
import os

# Keycloak configuration - single realm URL
KEYCLOAK_REALM_URL = os.getenv(
    'KEYCLOAK_REALM_URL',
    'https://auth-dev.snowse.io/realms/incrementum'
)
KEYCLOAK_CLIENT_ID = os.getenv('KEYCLOAK_CLIENT_ID', 'incrementum-client')
KEYCLOAK_CLIENT_SECRET = os.getenv('KEYCLOAK_CLIENT_SECRET', '')

# Parse base URL and realm from the full realm URL
KEYCLOAK_URL = (
    KEYCLOAK_REALM_URL.rsplit('/realms/', 1)[0]
    if '/realms/' in KEYCLOAK_REALM_URL
    else KEYCLOAK_REALM_URL
)
KEYCLOAK_REALM = (
    KEYCLOAK_REALM_URL.rsplit('/realms/', 1)[1]
    if '/realms/' in KEYCLOAK_REALM_URL
    else 'incrementum'
)


def get_keycloak_openid():
    return KeycloakOpenID(
        server_url=KEYCLOAK_URL,
        client_id=KEYCLOAK_CLIENT_ID,
        realm_name=KEYCLOAK_REALM,
        client_secret_key=KEYCLOAK_CLIENT_SECRET if KEYCLOAK_CLIENT_SECRET else None
    )


def get_token_with_password(username, password):
    try:
        keycloak_openid = get_keycloak_openid()
        token = keycloak_openid.token(username, password)
        return token.get('access_token')

    except Exception as e:
        print(f"Error getting token with password: {e}")
        return None


def verify_keycloak_token(token):
    try:
        keycloak_openid = get_keycloak_openid()
        token_info = keycloak_openid.decode_token(token)
        if token_info:
            return token_info
        return None
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None
