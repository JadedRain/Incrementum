import pytest
import json
import unittest.mock
from django.urls import reverse
from rest_framework.test import APIClient
from Incrementum import get_stock_info
from Incrementum.stocks_class import Stock
from Incrementum.get_stock_info import screen_stocks_by_average_volume

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


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
    response_data = response.json()
    assert 'stocks' in response_data
    assert len(response_data['stocks']) == 2
    
    symbols = [stock['symbol'] for stock in response_data['stocks']]
    assert 'HIGH_VOL1' in symbols
    assert 'HIGH_VOL2' in symbols


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
    response_data = response.json()
    assert 'stocks' in response_data
    assert len(response_data['stocks']) == 2
    
    symbols = [stock['symbol'] for stock in response_data['stocks']]
    assert 'LOW_VOL1' in symbols
    assert 'LOW_VOL2' in symbols


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
    response_data = response.json()
    assert 'stocks' in response_data
    assert len(response_data['stocks']) == 5
    
    # Test second page
    response = api_client.get(url, {
        'max': 5, 
        'offset': 5,
        'filters': json.dumps(filters)
    })
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert len(response_data['stocks']) == 5


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
    response_data = response.json()
    assert 'error' in response_data


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
    response_data = response.json()
    assert 'stocks' in response_data
    assert len(response_data['stocks']) == 1
    assert response_data['stocks'][0]['symbol'] == 'EXACT_VOL'


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
    response_data = response.json()
    assert 'stocks' in response_data
    assert len(response_data['stocks']) == 2


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
    response_data = response.json()
    assert 'stocks' in response_data
