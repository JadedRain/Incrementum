import pytest
pytestmark = pytest.mark.django_db
import json
import pandas as pd
from django.urls import reverse
from rest_framework.test import APIClient
from hello.get_stock_info import search_stocks
from hello import get_stock_info
from hello.stocks_class import Stock
from hello.get_stock_info import screen_stocks_by_average_volume
from . import views
from hello.get_stock_info import screen_stocks_by_average_volume
import unittest.mock
from hello.get_stock_info import screen_stocks_by_average_volume
    
    

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_get_stock_info(api_client):
    url = reverse('get_stock_info')
    response = api_client.get(url, {'max': 1, 'offset': 0})
    assert response.status_code == 200
    assert 'stocks' in response.data
    
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
    assert len(response.data['stocks']) == 2
    first_page_symbols = [stock['symbol'] for stock in response.data['stocks']]
    assert 'PAGE0' in first_page_symbols
    assert 'PAGE1' in first_page_symbols
    
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

@pytest.mark.django_db
def test_get_stock_info_with_average_volume_greater_than(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    def mock_screen_stocks_by_average_volume(filter_type, value, max_results=100):
        mock_stocks = [
            Stock({
                'symbol': 'HIGH_VOL1',
                'shortName': 'High Volume Stock 1',
                'averageVolume': 15000000,
                'regularMarketPrice': 150.0
            }),
            Stock({
                'symbol': 'HIGH_VOL2', 
                'shortName': 'High Volume Stock 2',
                'averageVolume': 12000000,
                'regularMarketPrice': 85.0
            })
        ]
        return mock_stocks
    
    monkeypatch.setattr(get_stock_info, 'screen_stocks_by_average_volume', mock_screen_stocks_by_average_volume)
    
    filters = {
        'average_volume_filter': 'gt',
        'average_volume_value': 10000000
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
    assert 'HIGH_VOL1' in symbols
    assert 'HIGH_VOL2' in symbols

@pytest.mark.django_db
def test_get_stock_info_with_average_volume_less_than(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    def mock_screen_stocks_by_average_volume(filter_type, value, max_results=100):
        mock_stocks = [
            Stock({
                'symbol': 'LOW_VOL1',
                'shortName': 'Low Volume Stock 1',
                'averageVolume': 500000,
                'regularMarketPrice': 25.0
            }),
            Stock({
                'symbol': 'LOW_VOL2', 
                'shortName': 'Low Volume Stock 2',
                'averageVolume': 750000,
                'regularMarketPrice': 30.0
            })
        ]
        return mock_stocks
    
    monkeypatch.setattr(get_stock_info, 'screen_stocks_by_average_volume', mock_screen_stocks_by_average_volume)
    
    filters = {
        'average_volume_filter': 'lt',
        'average_volume_value': 1000000
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
    assert 'LOW_VOL1' in symbols
    assert 'LOW_VOL2' in symbols

@pytest.mark.django_db
def test_get_stock_info_average_volume_pagination(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    # Mock function that returns more stocks than requested page size
    def mock_screen_stocks_by_average_volume(filter_type, value, max_results=100):
        mock_stocks = []
        for i in range(15):  # Create 15 mock stocks
            mock_stocks.append(Stock({
                'symbol': f'VOL{i:03d}',
                'shortName': f'Volume Stock {i}',
                'averageVolume': 5000000 + (i * 100000),
                'regularMarketPrice': 50.0 + i
            }))
        return mock_stocks
    
    monkeypatch.setattr(get_stock_info, 'screen_stocks_by_average_volume', mock_screen_stocks_by_average_volume)
    
    filters = {
        'average_volume_filter': 'gt',
        'average_volume_value': 4000000
    }
    
    # Test first page
    response = api_client.get(url, {
        'max': 5, 
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert 'stocks' in response.data
    assert len(response.data['stocks']) == 5
    
    # Test second page
    response = api_client.get(url, {
        'max': 5, 
        'offset': 5,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert 'stocks' in response.data
    assert len(response.data['stocks']) == 5

@pytest.mark.django_db
def test_get_stock_info_invalid_average_volume_filter(api_client):
    url = reverse('get_stock_info')
    
    filters = {
        'average_volume_filter': 'invalid_filter',
        'average_volume_value': 5000000
    }
    
    response = api_client.get(url, {
        'max': 2,
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 500
    assert 'error' in response.data

def test_screen_stocks_by_average_volume_invalid_filter():
    with pytest.raises(ValueError) as excinfo:
        screen_stocks_by_average_volume('invalid', 5000000)
    
    assert "Invalid average_volume_filter" in str(excinfo.value)
    assert "Must be one of: ['gt', 'gte', 'lt', 'lte', 'eq']" in str(excinfo.value)

def test_screen_stocks_by_average_volume_valid_filters():
    valid_filters = ['gt', 'gte', 'lt', 'lte', 'eq']
    
    for filter_type in valid_filters:
        try:
            screen_stocks_by_average_volume(filter_type, 5000000, max_results=1)
        except ValueError:
            pytest.fail(f"Valid filter '{filter_type}' raised ValueError")

def test_screen_stocks_by_average_volume_max_results_limit():
    with unittest.mock.patch('yfinance.screen') as mock_screen:
        mock_screen.return_value = {'quotes': []}
        
        screen_stocks_by_average_volume('gt', 5000000, max_results=500)
        
        mock_screen.assert_called_once()
        call_args = mock_screen.call_args
        assert call_args[1]['size'] == 250

@pytest.mark.django_db
def test_get_stock_info_with_average_volume_equal_to(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    def mock_screen_stocks_by_average_volume(filter_type, value, max_results=100):
        mock_stocks = [
            Stock({
                'symbol': 'EXACT_VOL',
                'shortName': 'Exact Volume Stock',
                'averageVolume': 5000000,
                'regularMarketPrice': 100.0
            })
        ]
        return mock_stocks
    
    monkeypatch.setattr(get_stock_info, 'screen_stocks_by_average_volume', mock_screen_stocks_by_average_volume)
    
    filters = {
        'average_volume_filter': 'eq',
        'average_volume_value': 5000000
    }
    
    response = api_client.get(url, {
        'max': 10, 
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert 'stocks' in response.data
    assert len(response.data['stocks']) == 1
    assert response.data['stocks'][0]['symbol'] == 'EXACT_VOL'

@pytest.mark.django_db  
def test_get_stock_info_with_average_volume_greater_than_or_equal(api_client, monkeypatch):
    url = reverse('get_stock_info')
    
    def mock_screen_stocks_by_average_volume(filter_type, value, max_results=100):
        mock_stocks = [
            Stock({
                'symbol': 'GTE_VOL1',
                'shortName': 'GTE Volume Stock 1',
                'averageVolume': 5000000,
                'regularMarketPrice': 120.0
            }),
            Stock({
                'symbol': 'GTE_VOL2',
                'shortName': 'GTE Volume Stock 2', 
                'averageVolume': 6000000,
                'regularMarketPrice': 140.0
            })
        ]
        return mock_stocks
    
    monkeypatch.setattr(get_stock_info, 'screen_stocks_by_average_volume', mock_screen_stocks_by_average_volume)
    
    filters = {
        'average_volume_filter': 'gte',
        'average_volume_value': 5000000
    }
    
    response = api_client.get(url, {
        'max': 10, 
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert 'stocks' in response.data
    assert len(response.data['stocks']) == 2

@pytest.mark.django_db
def test_get_stock_info_missing_average_volume_value(api_client):
    url = reverse('get_stock_info')
    
    filters = {
        'average_volume_filter': 'gt'
    }
    
    response = api_client.get(url, {
        'max': 2,
        'offset': 0,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    assert 'stocks' in response.data