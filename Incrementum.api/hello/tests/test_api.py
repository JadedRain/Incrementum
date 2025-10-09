import pytest
pytestmark = pytest.mark.django_db
from django.urls import reverse
from rest_framework.test import APIClient
from hello.get_stock_info import search_stocks
from hello import views
from hello import filters_controller


@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_get_stock_info(api_client):
    url = reverse('get_stock_info')
    response = api_client.get(url, {'max': 1, 'offset': 0})
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data

@pytest.mark.django_db
def test_symbol_priority():
    results = search_stocks('TS', 0)
    symbols = [r['symbol'] for r in results]

    assert all(s.startswith('TS') for s in symbols if s.startswith('TS'))

@pytest.mark.django_db
def test_name_fallback():
    results = search_stocks('Technologies', 0)
    assert any('Technologies' in r['name'] for r in results)


@pytest.mark.django_db
def test_get_sectors_success(api_client, monkeypatch):
    url = reverse('sectors')

    def fake_get_unique_sectors(path):
        return ['Technology', 'Finance', 'Healthcare']

    monkeypatch.setattr(filters_controller, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 200
    response_data = response.json()
    assert 'sectors' in response_data
    assert response_data['sectors'] == ['Technology', 'Finance', 'Healthcare']


@pytest.mark.django_db
def test_get_sectors_failure_returns_500(api_client, monkeypatch):
    url = reverse('sectors')

    def fake_get_unique_sectors(path):
        raise ValueError('CSV missing')

    monkeypatch.setattr(filters_controller, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 500
    response_data = response.json()
    assert 'error' in response_data
    assert 'CSV missing' in response_data['error']


@pytest.mark.django_db
def test_get_industries_success(api_client, monkeypatch):
    url = reverse('industries')

    def fake_get_unique_industries(path):
        return ['software', 'pharmaceuticals', 'banking']

    monkeypatch.setattr(filters_controller, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.get(url)
    assert response.status_code == 200
    response_data = response.json()
    assert 'industries' in response_data
    assert response_data['industries'] == ['software', 'pharmaceuticals', 'banking']


@pytest.mark.django_db
def test_get_industries_failure_returns_500(api_client, monkeypatch):
    url = reverse('industries')

    def fake_get_unique_industries(path):
        raise RuntimeError('read error')

    monkeypatch.setattr(filters_controller, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.get(url)
    assert response.status_code == 500
    response_data = response.json()
    assert 'error' in response_data
    assert 'read error' in response_data['error']

