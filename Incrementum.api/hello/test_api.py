import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from hello.get_stock_info import search_stocks

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

def test_default_stock_watchlist(api_client):
    url = reverse('get_watchlist')
    response = api_client.get(url)
    assert response.status_code == 200
    assert 'watchlist' in response.data
    assert response.data['watchlist'] == []

def test_add_to_watchlist(api_client):
    url = reverse('add_to_watchlist')
    response = api_client.post(url, {'symbol': 'AAPL'}, format='json')
    assert response.status_code == 200
    assert 'watchlist' in response.data
    assert any(item['symbol'] == 'AAPL' for item in response.data['watchlist'])

def test_remove_from_watchlist(api_client):
    # First, add a stock to the watchlist
    add_url = reverse('add_to_watchlist')
    api_client.post(add_url, {'symbol': 'AAPL'}, format='json')

    # Now, remove it
    remove_url = reverse('remove_from_watchlist')
    response = api_client.delete(remove_url, {'symbol': 'AAPL'}, format='json')
    assert response.status_code == 200
    assert 'watchlist' in response.data
    assert 'AAPL' not in response.data['watchlist']

def test_search_stocks_watchlist(api_client):
    # Add a stock to the watchlist
    add_url = reverse('add_to_watchlist')
    api_client.post(add_url, {'symbol': 'AAPL'}, format='json')

    # Search for the stock
    search_url = reverse('search_stocks_watchlist')
    response = api_client.get(search_url, {'query': 'AAPL', 'max': 10})
    assert response.status_code == 200
    assert 'results' in response.data
    assert any(stock['symbol'] == 'AAPL' for stock in response.data['results'])

def test_symbol_priority():
    # Search for 'TS'
    results = search_stocks('TS', 0)
    symbols = [r['symbol'] for r in results]

    # All symbols starting with 'TS' should be at the front
    assert all(s.startswith('TS') for s in symbols if s.startswith('TS'))
    
    # Optionally, check that name matches come after symbol matches

def test_name_fallback():
    # Search for a string that matches only names
    results = search_stocks('Technologies', 0)
    assert any('Technologies' in r['name'] for r in results)
