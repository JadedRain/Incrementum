import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from Incrementum.controllers import filters_controller

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


def test_get_sectors_success(api_client, monkeypatch):
    url = reverse('sectors')

    def fake_get_unique_sectors():
        return ['Technology', 'Finance', 'Healthcare']

    monkeypatch.setattr(filters_controller, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 200
    response_data = response.json()
    assert 'sectors' in response_data
    assert response_data['sectors'] == ['Technology', 'Finance', 'Healthcare']


def test_get_sectors_failure_returns_500(api_client, monkeypatch):
    url = reverse('sectors')

    def fake_get_unique_sectors():
        raise ValueError('CSV missing')

    monkeypatch.setattr(filters_controller, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 500
    response_data = response.json()
    assert 'error' in response_data
    assert 'CSV missing' in response_data['error']


def test_get_industries_success(api_client, monkeypatch):
    url = reverse('industries')

    def fake_get_unique_industries(sectors=None):
        return ['software', 'pharmaceuticals', 'banking']

    monkeypatch.setattr(filters_controller, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.post(url, {}, format='json')
    assert response.status_code == 200
    response_data = response.json()
    assert 'industries' in response_data
    assert response_data['industries'] == ['software', 'pharmaceuticals', 'banking']


def test_get_industries_failure_returns_500(api_client, monkeypatch):
    url = reverse('industries')

    def fake_get_unique_industries(sectors=None):
        raise RuntimeError('read error')

    monkeypatch.setattr(filters_controller, 'get_unique_industries', fake_get_unique_industries)

    # Endpoint is POST — send empty JSON to trigger controller behavior
    response = api_client.post(url, {}, format='json')
    assert response.status_code == 500
    response_data = response.json()
    assert 'error' in response_data
    assert 'read error' in response_data['error']
