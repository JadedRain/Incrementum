import pytest
import json
from Incrementum.models_user import Account
from django.urls import reverse
from rest_framework.test import APIClient
pytestmark = pytest.mark.django_db


def test_create_and_get_custom_screener_api():
    client = APIClient()

    account = Account.objects.create(
        name="API User",
        phone_number="9999999999",
        email="apiuser@example.com",
        password_hash="hash",
        api_key="api-user-key-123"
    )

    url = reverse('custom_screener_list_create')

    payload = {
        "screener_name": "My API Screener",
        "numeric_filters": [
            {"filter_name": "revenue", "numeric_value": 100000000},
        ],
        "categorical_filters": [
            {"filter_name": "exchange", "category_value": "NASDAQ"},
        ]
    }

    response = client.post(
        url,
        data=json.dumps(payload),
        content_type='application/json',
        HTTP_X_USER_ID=account.api_key
    )
    assert response.status_code == 201, (
        f"Unexpected status: {response.status_code}, "
        f"body: {response.content}"
    )
    data = response.json()
    assert 'id' in data
    screener_id = data['id']

    get_url = reverse('get_custom_screener', args=[screener_id])
    get_resp = client.get(get_url, HTTP_X_USER_ID=account.api_key)
    assert get_resp.status_code == 200, f"GET failed: {get_resp.content}"
    screener = get_resp.json()

    assert screener['id'] == screener_id
    assert isinstance(screener.get('numeric_filters'), list)
    assert isinstance(screener.get('categorical_filters'), list)

    nf = screener['numeric_filters'][0]
    assert nf.get('operator') is not None
    assert nf.get('operand') == 'revenue'
    assert nf.get('filter_type') == 'numeric'
    assert nf.get('value') == 100000000

    cf = screener['categorical_filters'][0]
    assert cf.get('operator') is not None
    assert cf.get('operand') == 'exchange'
    assert cf.get('filter_type') == 'categorical'
    assert cf.get('value') == 'NASDAQ'


def test_update_custom_screener_api():
    client = APIClient()

    account = Account.objects.create(
        name="API User 2",
        phone_number="8888888888",
        email="apiuser2@example.com",
        password_hash="hash2",
        api_key="api-user-key-456"
    )

    url = reverse('custom_screener_list_create')
    payload = {
        "screener_name": "Updatable Screener",
        "numeric_filters": [
            {"filter_name": "revenue", "numeric_value": 50000000},
        ],
        "categorical_filters": [
            {"filter_name": "exchange", "category_value": "NYSE"},
        ]
    }

    resp = client.post(
        url,
        data=json.dumps(payload),
        content_type='application/json',
        HTTP_X_USER_ID=account.api_key
    )
    assert resp.status_code == 201
    screener_id = resp.json()['id']

    update_url = reverse('update_custom_screener', args=[screener_id])
    update_payload = {
        "numeric_filters": [
            {"filter_name": "market_cap", "numeric_value": 2000000000},
        ],
        "categorical_filters": [
            {"filter_name": "sector", "category_value": "Healthcare"}
        ]
    }

    put_resp = client.put(
        update_url,
        data=json.dumps(update_payload),
        content_type='application/json',
        HTTP_X_USER_ID=account.api_key
    )
    assert put_resp.status_code == 200, f"Update failed: {put_resp.content}"

    get_url = reverse('get_custom_screener', args=[screener_id])
    get_resp = client.get(get_url, HTTP_X_USER_ID=account.api_key)
    assert get_resp.status_code == 200
    updated = get_resp.json()

    numeric = updated.get('numeric_filters', [])
    categorical = updated.get('categorical_filters', [])

    assert any(n.get('operand') == 'market_cap' and n.get('value') == 2000000000 for n in numeric)
    assert any(c.get('operand') == 'sector' and c.get('value') == 'Healthcare' for c in categorical)


def test_create_custom_screener_with_range_filter_api():
    client = APIClient()

    account = Account.objects.create(
        name="API User Range",
        phone_number="7777777777",
        email="apiuserrange@example.com",
        password_hash="hash3",
        api_key="api-user-key-789"
    )

    url = reverse('custom_screener_list_create')

    payload = {
        "screener_name": "Range Screener",
        "numeric_filters": [
            {"filter_name": "market_cap", "numeric_value": [1000000, 5000000]},
        ],
        "categorical_filters": [
            {"filter_name": "sector", "category_value": "Technology"},
        ]
    }

    response = client.post(
        url,
        data=json.dumps(payload),
        content_type='application/json',
        HTTP_X_USER_ID=account.api_key
    )
    assert response.status_code == 201, (
        f"Unexpected status: {response.status_code}, "
        f"body: {response.content}"
    )
    screener_id = response.json()['id']

    get_url = reverse('get_custom_screener', args=[screener_id])
    get_resp = client.get(get_url, HTTP_X_USER_ID=account.api_key)
    assert get_resp.status_code == 200, f"GET failed: {get_resp.content}"
    screener = get_resp.json()

    nf_list = screener.get('numeric_filters', [])
    assert len(nf_list) == 1
    nf = nf_list[0]
    # for range, 'value' should be None and value_low/value_high populated
    assert nf.get('operand') == 'market_cap'
    assert nf.get('value') is None or nf.get('value') == [] or nf.get('value') == ''
    assert nf.get('value_low') == 1000000
    assert nf.get('value_high') == 5000000
