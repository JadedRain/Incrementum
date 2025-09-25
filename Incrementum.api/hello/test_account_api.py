import pytest
from django.test import Client
from .models_user import Account
import uuid
import bcrypt

@pytest.mark.django_db
def test_signup_and_account_info():
    client = Client()
    name = "Test User"
    phone_number = "1234567890"
    email = "testuser@example.com"
    password = "securepassword"

    # Signup
    response = client.post("/api/signup", data={
        "name": name,
        "phone_number": phone_number,
        "email": email,
        "password": password
    }, content_type="application/json")
    assert response.status_code == 200
    api_key = response.json()["api_key"]

    # Check user is saved in DB
    account = Account.objects.get(email=email)
    assert account.name == name
    assert account.phone_number == phone_number
    assert bcrypt.checkpw(password.encode(), account.password_hash.encode())
    assert account.api_key == api_key

    # Get account info
    response = client.post("/api/account", data={"api_key": api_key}, content_type="application/json")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == name
    assert data["email"] == email
    assert data["phone_number"] == phone_number

@pytest.mark.django_db
def test_account_info_invalid_api_key():
    client = Client()
    response = client.post("/api/account", data={"api_key": str(uuid.uuid4())}, content_type="application/json")
    assert response.status_code == 401
    assert "error" in response.json()
