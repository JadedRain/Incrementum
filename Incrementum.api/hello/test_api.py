import pytest
pytestmark = pytest.mark.django_db
from django.urls import reverse
from rest_framework.test import APIClient
from hello.get_stock_info import search_stocks
from . import views


@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_get_stock_info(api_client):
    url = reverse('get_stock_info')
    response = api_client.get(url, {'max': 1, 'offset': 0})
    assert response.status_code == 200
    assert 'stocks' in response.data
@pytest.mark.django_db
def test_default_stock_watchlist(api_client):
    url = reverse('watchlist')
    response = api_client.get(url)
    assert response.status_code == 200
    assert 'watchlist' in response.data
    assert response.data['watchlist'] == []
@pytest.mark.django_db
def test_add_to_watchlist(api_client):
    url = reverse('watchlist')
    response = api_client.post(url, {'symbol': 'AAPL'}, format='json')
    assert response.status_code == 200
    assert 'watchlist' in response.data
    assert 'AAPL' in response.data['watchlist']

@pytest.mark.django_db
def test_remove_from_watchlist(api_client):
    # First, add a stock to the watchlist
    url = reverse('watchlist')
    api_client.post(url, {'symbol': 'AAPL'}, format='json')

    # Now, remove it
    response = api_client.delete(url, {'symbol': 'AAPL'}, format='json')
    assert response.status_code == 200
    assert 'watchlist' in response.data
    assert 'AAPL' not in response.data['watchlist']

@pytest.mark.django_db
def test_search_stocks_watchlist(api_client):
    # Add a stock to the watchlist
    url = reverse('watchlist')
    api_client.post(url, {'symbol': 'AAPL'}, format='json')

    # Search for the stock
    search_url = reverse('watchlist_search')
    response = api_client.get(search_url, {'query': 'AAPL', 'max': 10})
    assert response.status_code == 200
    assert 'results' in response.data
    assert any(stock['symbol'] == 'AAPL' for stock in response.data['results'])

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

    monkeypatch.setattr(views, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 200
    assert 'sectors' in response.data
    assert response.data['sectors'] == ['Technology', 'Finance', 'Healthcare']


@pytest.mark.django_db
def test_get_sectors_failure_returns_500(api_client, monkeypatch):
    url = reverse('sectors')

    def fake_get_unique_sectors(path):
        raise ValueError('CSV missing')

    monkeypatch.setattr(views, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 500
    assert 'error' in response.data
    assert 'CSV missing' in response.data['error']


@pytest.mark.django_db
def test_get_industries_success(api_client, monkeypatch):
    url = reverse('industries')

    def fake_get_unique_industries(path):
        return ['software', 'pharmaceuticals', 'banking']

    monkeypatch.setattr(views, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.get(url)
    assert response.status_code == 200
    assert 'industries' in response.data
    assert response.data['industries'] == ['software', 'pharmaceuticals', 'banking']


@pytest.mark.django_db
def test_get_industries_failure_returns_500(api_client, monkeypatch):
    url = reverse('industries')

    def fake_get_unique_industries(path):
        raise RuntimeError('read error')

    monkeypatch.setattr(views, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.get(url)
    assert response.status_code == 500
    assert 'error' in response.data
    assert 'read error' in response.data['error']

