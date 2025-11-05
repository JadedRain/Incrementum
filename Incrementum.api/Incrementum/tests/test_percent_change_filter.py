import pytest
import json
from django.urls import reverse
from rest_framework.test import APIClient
from Incrementum import get_stock_info
from Incrementum.stocks_class import Stock

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


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
    response_data = response.json()
    assert 'stocks' in response_data
    assert len(response_data['stocks']) == 2
    
    symbols = [stock['symbol'] for stock in response_data['stocks']]
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
    response_data = response.json()
    assert 'stocks' in response_data
    assert len(response_data['stocks']) == 1
    assert response_data['stocks'][0]['symbol'] == 'LOSER1'


def test_get_stock_info_percent_change_pagination(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    
    def mock_screen_stocks_by_percent_change(filter_type, value, max_results=100):
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
    
    response = api_client.get(url, {
        'max': 2,
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    response_data = response.json()
    assert len(response_data['stocks']) == 2
    first_page_symbols = [stock['symbol'] for stock in response_data['stocks']]
    assert 'PAGE0' in first_page_symbols
    assert 'PAGE1' in first_page_symbols
    
    response = api_client.get(url, {
        'max': 2,
        'offset': 2,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    response_data = response.json()
    assert len(response_data['stocks']) == 2
    second_page_symbols = [stock['symbol'] for stock in response_data['stocks']]
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
    response_data = response.json()
    assert 'error' in response_data


def test_get_stock_info_percent_change_without_value(api_client):
    url = reverse('get_stock_info')
    
    filters = {
        'percent_change_filter': 'gt'
    }
    
    response = api_client.get(url, {
        'max': 2,
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
