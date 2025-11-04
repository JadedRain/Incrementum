from keycloak import KeycloakOpenID
import os

# Keycloak configuration - single realm URL
KEYCLOAK_REALM_URL = os.getenv('KEYCLOAK_REALM_URL', 'https://auth-dev.snowse.io/realms/DevRealm')
KEYCLOAK_CLIENT_ID = os.getenv('KEYCLOAK_CLIENT_ID', 'incrementum-client')
KEYCLOAK_CLIENT_SECRET = os.getenv('KEYCLOAK_CLIENT_SECRET', '')

# Parse base URL and realm from the full realm URL
KEYCLOAK_URL = KEYCLOAK_REALM_URL.rsplit('/realms/', 1)[0] if '/realms/' in KEYCLOAK_REALM_URL else KEYCLOAK_REALM_URL
KEYCLOAK_REALM = KEYCLOAK_REALM_URL.rsplit('/realms/', 1)[1] if '/realms/' in KEYCLOAK_REALM_URL else 'DevRealm'

def verify_keycloak_token(token):
    try:
        keycloak_openid = KeycloakOpenID(
            server_url=KEYCLOAK_URL,
            client_id=KEYCLOAK_CLIENT_ID,
            realm_name=KEYCLOAK_REALM,
            client_secret_key=KEYCLOAK_CLIENT_SECRET
        )
        
        # Decode and verify token
        token_info = keycloak_openid.introspect(token)
        
        if token_info.get('active'):
            return token_info
        return None
        
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None

