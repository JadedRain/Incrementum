import pytest
pytestmark = pytest.mark.django_db
import json
import pandas as pd
from django.urls import reverse
from rest_framework.test import APIClient
from hello.get_stock_info import search_stocks
from hello import get_stock_info
from hello.stocks_class import Stock


from . import views


@pytest.fixture
def api_client():
    return APIClient()

def test_get_stock_info(api_client):
    url = reverse('get_stock_info')
    response = api_client.get(url, {'max': 1, 'offset': 0})
    assert response.status_code == 200
    assert 'stocks' in response.data
    
def test_symbol_priority():
    results = search_stocks('TS', 0)
    symbols = [r['symbol'] for r in results]

    assert all(s.startswith('TS') for s in symbols if s.startswith('TS'))
    
def test_name_fallback():
    results = search_stocks('Technologies', 0)
    assert any('Technologies' in r['name'] for r in results)


def test_get_sectors_success(api_client, monkeypatch):
    url = reverse('sectors')

    def fake_get_unique_sectors(path):
        return ['Technology', 'Finance', 'Healthcare']

    monkeypatch.setattr(views, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 200
    assert 'sectors' in response.data
    assert response.data['sectors'] == ['Technology', 'Finance', 'Healthcare']


def test_get_sectors_failure_returns_500(api_client, monkeypatch):
    url = reverse('sectors')

    def fake_get_unique_sectors(path):
        raise ValueError('CSV missing')

    monkeypatch.setattr(views, 'get_unique_sectors', fake_get_unique_sectors)

    response = api_client.get(url)
    assert response.status_code == 500
    assert 'error' in response.data
    assert 'CSV missing' in response.data['error']


def test_get_industries_success(api_client, monkeypatch):
    url = reverse('industries')

    def fake_get_unique_industries(path):
        return ['software', 'pharmaceuticals', 'banking']

    monkeypatch.setattr(views, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.get(url)
    assert response.status_code == 200
    assert 'industries' in response.data
    assert response.data['industries'] == ['software', 'pharmaceuticals', 'banking']


def test_get_industries_failure_returns_500(api_client, monkeypatch):
    url = reverse('industries')

    def fake_get_unique_industries(path):
        raise RuntimeError('read error')

    monkeypatch.setattr(views, 'get_unique_industries', fake_get_unique_industries)

    response = api_client.get(url)
    assert response.status_code == 500
    assert 'error' in response.data
    assert 'read error' in response.data['error']


def test_get_stock_info_with_percent_change_greater_than(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    def mock_screen_stocks_by_percent_change(filter_type, value, max_results=100):
        mock_stocks = [
            Stock({
                'symbol': 'MOCK1',
                'shortName': 'Mock Stock 1',
                'regularMarketChangePercent': 7.5,
                'regularMarketPrice': 100.0
            }),
            Stock({
                'symbol': 'MOCK2', 
                'shortName': 'Mock Stock 2',
                'regularMarketChangePercent': 6.2,
                'regularMarketPrice': 50.0
            })
        ]
        return mock_stocks
    
    monkeypatch.setattr(get_stock_info, 'screen_stocks_by_percent_change', mock_screen_stocks_by_percent_change)
    
    filters = {
        'percent_change_filter': 'gt',
        'percent_change_value': 5.0
    }
    
    response = api_client.get(url, {
        'max': 10, 
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert 'stocks' in response.data
    assert len(response.data['stocks']) == 2
    
    symbols = [stock['symbol'] for stock in response.data['stocks']]
    assert 'MOCK1' in symbols
    assert 'MOCK2' in symbols


def test_get_stock_info_with_percent_change_less_than(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    def mock_screen_stocks_by_percent_change(filter_type, value, max_results=100):
        mock_stocks = [
            Stock({
                'symbol': 'LOSER1',
                'shortName': 'Declining Stock 1',
                'regularMarketChangePercent': -3.5,
                'regularMarketPrice': 25.0
            })
        ]
        return mock_stocks
    
    monkeypatch.setattr(get_stock_info, 'screen_stocks_by_percent_change', mock_screen_stocks_by_percent_change)
    
    filters = {
        'percent_change_filter': 'lt',
        'percent_change_value': -2.0
    }
    
    response = api_client.get(url, {
        'max': 10,
        'offset': 0, 
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert 'stocks' in response.data
    assert len(response.data['stocks']) == 1
    assert response.data['stocks'][0]['symbol'] == 'LOSER1'


def test_get_stock_info_percent_change_pagination(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    
    def mock_screen_stocks_by_percent_change(filter_type, value, max_results=100):
        # Create 5 mock stocks for testing pagination
        mock_stocks = []
        for i in range(5):
            mock_stocks.append(Stock({
                'symbol': f'PAGE{i}',
                'shortName': f'Page Test Stock {i}',
                'regularMarketChangePercent': 8.0 + i,
                'regularMarketPrice': 100.0 + i * 10
            }))
        return mock_stocks
    
    monkeypatch.setattr(get_stock_info, 'screen_stocks_by_percent_change', mock_screen_stocks_by_percent_change)
    
    filters = {
        'percent_change_filter': 'gt',
        'percent_change_value': 5.0
    }
    
    # Test first page (offset=0, max=2)
    response = api_client.get(url, {
        'max': 2,
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert len(response.data['stocks']) == 2
    first_page_symbols = [stock['symbol'] for stock in response.data['stocks']]
    assert 'PAGE0' in first_page_symbols
    assert 'PAGE1' in first_page_symbols
    
    # Test second page (offset=2, max=2) 
    response = api_client.get(url, {
        'max': 2,
        'offset': 2,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert len(response.data['stocks']) == 2
    second_page_symbols = [stock['symbol'] for stock in response.data['stocks']]
    assert 'PAGE2' in second_page_symbols
    assert 'PAGE3' in second_page_symbols


def test_get_stock_info_invalid_percent_change_filter(api_client):
    url = reverse('get_stock_info')
    
    filters = {
        'percent_change_filter': 'invalid_filter',
        'percent_change_value': 5.0
    }
    
    response = api_client.get(url, {
        'max': 10,
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 500
    assert 'error' in response.data


def test_get_stock_info_percent_change_without_value(api_client):
    url = reverse('get_stock_info')
    
    def mock_setup():
        return pd.DataFrame({
            'symbol': ['AAPL', 'MSFT'],
            'companyName': ['Apple Inc.', 'Microsoft Corporation'],
            'sectorKey': ['technology', 'technology'],
            'industryKey': ['consumer_electronics', 'software']
        })
    
    def mock_fetch_stock_data(symbol):
        from hello.stocks_class import Stock
        return Stock({
            'symbol': symbol,
            'shortName': f'{symbol} Company',
            'regularMarketPrice': 100.0
        })
    
    filters = {
        'percent_change_filter': 'gt'
    }
    
    response = api_client.get(url, {
        'max': 2,
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert 'stocks' in response.data

