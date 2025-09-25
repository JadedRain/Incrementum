import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from . import views


@pytest.fixture
def api_client():
    return APIClient()

def test_hello_world(api_client):
    url = reverse('hello_world')
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data['message'] == 'Hello, world!'

def test_get_stock_info(api_client):
    url = reverse('get_stock_info')
    response = api_client.get(url, {'max': 1, 'offset': 0})
    assert response.status_code == 200
    assert 'stocks' in response.data


def test_get_sectors_success(api_client, monkeypatch):
    url = reverse('get_sectors')

    # Patch the helper to return a predictable list
    def fake_get_unique_sectors(path):
        return ['Technology', 'Finance', 'Healthcare']

    monkeypatch.setattr(views, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 200
    assert 'sectors' in response.data
    assert response.data['sectors'] == ['Technology', 'Finance', 'Healthcare']


def test_get_sectors_failure_returns_500(api_client, monkeypatch):
    url = reverse('get_sectors')

    # Simulate an error reading the CSV
    def fake_get_unique_sectors(path):
        raise ValueError('CSV missing')

    monkeypatch.setattr(views, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 500
    assert 'error' in response.data
    assert 'CSV missing' in response.data['error']


def test_get_industries_success(api_client, monkeypatch):
    url = reverse('get_industries')

    def fake_get_unique_industries(path):
        return ['software', 'pharmaceuticals', 'banking']

    monkeypatch.setattr(views, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.get(url)
    assert response.status_code == 200
    assert 'industries' in response.data
    assert response.data['industries'] == ['software', 'pharmaceuticals', 'banking']


def test_get_industries_failure_returns_500(api_client, monkeypatch):
    url = reverse('get_industries')

    def fake_get_unique_industries(path):
        raise RuntimeError('read error')

    monkeypatch.setattr(views, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.get(url)
    assert response.status_code == 500
    assert 'error' in response.data
    assert 'read error' in response.data['error']

