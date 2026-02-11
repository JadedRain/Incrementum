import bcrypt
import json
import pytest
import uuid
from unittest.mock import patch
from django.test import Client
from Incrementum.models.account import Account

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return Client()


@pytest.fixture
def test_user():
    password = "testpassword123"
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = Account.objects.create(
        name="Test User",
        phone_number="1234567890",
        email="test@example.com",
        password_hash=password_hash,
        api_key=str(uuid.uuid4()),
        keycloak_id=None
    )
    user.plain_password = password
    return user


@pytest.fixture
def keycloak_user():
    user = Account.objects.create(
        name="Keycloak User",
        phone_number="kc_1234567890",
        email="keycloak@example.com",
        password_hash="",
        api_key=str(uuid.uuid4()),
        keycloak_id="keycloak-user-id-123"
    )
    return user


class TestSignup:
    def test_successful_signup(self, client):
        data = {
            'name': 'New User',
            'phone_number': '9876543210',
            'email': 'newuser@example.com',
            'password': 'securepassword123'
        }
        response = client.post(
            '/api/signup',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 200
        response_data = json.loads(response.content)
        assert 'api_key' in response_data

        user = Account.objects.get(email='newuser@example.com')
        assert user.name == 'New User'
        assert user.keycloak_id is None

    def test_signup_duplicate_email(self, client, test_user):
        data = {
            'name': 'Another User',
            'phone_number': '5555555555',
            'email': test_user.email,
            'password': 'password123'
        }
        response = client.post(
            '/api/signup',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 400
        response_data = json.loads(response.content)
        assert 'Email already in use' in response_data['error']


class TestLogin:
    def test_successful_login(self, client, test_user):
        data = {
            'email': test_user.email,
            'password': test_user.plain_password
        }
        response = client.post(
            '/api/login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 200
        response_data = json.loads(response.content)
        assert 'api_key' in response_data
        assert response_data['api_key'] == test_user.api_key

    def test_login_wrong_password(self, client, test_user):
        data = {
            'email': test_user.email,
            'password': 'wrongpassword'
        }
        response = client.post(
            '/api/login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 401
        response_data = json.loads(response.content)
        assert 'Invalid credentials' in response_data['error']

    def test_login_keycloak_user_rejected(self, client, keycloak_user):
        data = {
            'email': keycloak_user.email,
            'password': 'anypassword'
        }
        response = client.post(
            '/api/login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 401
        response_data = json.loads(response.content)
        assert 'Keycloak' in response_data['error']


class TestKeycloakLogin:
    @patch('Incrementum.views_auth.get_token_with_password')
    def test_successful_keycloak_login(self, mock_get_token, client):
        mock_get_token.return_value = 'fake-access-token-123'

        data = {
            'username': 'testuser',
            'password': 'password123'
        }
        response = client.post(
            '/api/keycloak-login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 200
        response_data = json.loads(response.content)
        assert 'access_token' in response_data
        mock_get_token.assert_called_once_with('testuser', 'password123')

    @patch('Incrementum.views_auth.get_token_with_password')
    def test_keycloak_login_invalid_credentials(self, mock_get_token, client):
        mock_get_token.return_value = None

        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = client.post(
            '/api/keycloak-login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 401


class TestSyncKeycloakUser:
    @patch('Incrementum.views_auth.verify_keycloak_token')
    def test_sync_new_keycloak_user(self, mock_verify, client):
        mock_verify.return_value = {
            'sub': 'keycloak-id-new',
            'email': 'newkeycloak@example.com',
            'preferred_username': 'newuser',
            'name': 'New Keycloak User'
        }

        data = {'token': 'fake-jwt-token'}
        response = client.post(
            '/api/sync-keycloak-user',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 200
        response_data = json.loads(response.content)
        assert 'api_key' in response_data

        user = Account.objects.get(keycloak_id='keycloak-id-new')
        assert user.email == 'newkeycloak@example.com'
        assert user.password_hash == ''

    @patch('Incrementum.views_auth.verify_keycloak_token')
    def test_sync_invalid_token(self, mock_verify, client):
        mock_verify.return_value = None

        data = {'token': 'invalid-token'}
        response = client.post(
            '/api/sync-keycloak-user',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 401
