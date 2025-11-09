import pytest
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
from Screeners.stock_getter import StockGetter

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()

@patch.object(StockGetter, 'get_stocks')
def test_day_volume_greater_than(mock_get_stocks, api_client):
    """Test filtering stocks with day volume greater than a threshold"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'HIGH_DAY_VOL1',
            'shortName': 'High Day Volume Stock 1',
            'volume': 25000000,
            'regularMarketPrice': 150.0
        },
        {
            'symbol': 'HIGH_DAY_VOL2',
            'shortName': 'High Day Volume Stock 2',
            'volume': 20000000,
            'regularMarketPrice': 85.0
        }
    ]
    
    filters = [
        {
            'operator': 'gt',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 15000000
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 2
    assert len(response_data['stocks']) == 2
    
    symbols = [stock['symbol'] for stock in response_data['stocks']]
    assert 'HIGH_DAY_VOL1' in symbols
    assert 'HIGH_DAY_VOL2' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_day_volume_less_than(mock_get_stocks, api_client):
    """Test filtering stocks with day volume less than a threshold"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'LOW_DAY_VOL1',
            'shortName': 'Low Day Volume Stock 1',
            'volume': 800000,
            'regularMarketPrice': 25.0
        },
        {
            'symbol': 'LOW_DAY_VOL2',
            'shortName': 'Low Day Volume Stock 2',
            'volume': 950000,
            'regularMarketPrice': 30.0
        }
    ]
    
    filters = [
        {
            'operator': 'lt',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 1000000
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 2
    
    symbols = [stock['symbol'] for stock in response_data['stocks']]
    assert 'LOW_DAY_VOL1' in symbols
    assert 'LOW_DAY_VOL2' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_day_volume_greater_than_or_equal(mock_get_stocks, api_client):
    """Test filtering stocks with day volume greater than or equal to a threshold"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'GTE_DAY_VOL1',
            'shortName': 'GTE Day Volume Stock 1',
            'volume': 5000000,
            'regularMarketPrice': 120.0
        },
        {
            'symbol': 'GTE_DAY_VOL2',
            'shortName': 'GTE Day Volume Stock 2',
            'volume': 6000000,
            'regularMarketPrice': 140.0
        }
    ]
    
    filters = [
        {
            'operator': 'gte',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 5000000
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 2


@patch.object(StockGetter, 'get_stocks')
def test_day_volume_less_than_or_equal(mock_get_stocks, api_client):
    """Test filtering stocks with day volume less than or equal to a threshold"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'LTE_DAY_VOL1',
            'shortName': 'LTE Day Volume Stock 1',
            'volume': 2000000,
            'regularMarketPrice': 45.0
        },
        {
            'symbol': 'LTE_DAY_VOL2',
            'shortName': 'LTE Day Volume Stock 2',
            'volume': 3000000,
            'regularMarketPrice': 55.0
        }
    ]
    
    filters = [
        {
            'operator': 'lte',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 3000000
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 2


@patch.object(StockGetter, 'get_stocks')
def test_day_volume_equal_to(mock_get_stocks, api_client):
    """Test filtering stocks with day volume exactly equal to a value"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'EXACT_DAY_VOL',
            'shortName': 'Exact Day Volume Stock',
            'volume': 5000000,
            'regularMarketPrice': 100.0
        }
    ]
    
    filters = [
        {
            'operator': 'eq',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 5000000
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 1
    assert response_data['stocks'][0]['symbol'] == 'EXACT_DAY_VOL'


@patch.object(StockGetter, 'get_stocks')
def test_day_volume_combined_with_sector(mock_get_stocks, api_client):
    """Test combining day volume filter with sector filter"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'TECH_HIGH_VOL',
            'shortName': 'Tech High Volume Stock',
            'sector': 'Technology',
            'volume': 10000000,
            'regularMarketPrice': 200.0
        }
    ]
    
    filters = [
        {
            'operator': 'gt',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 5000000
        },
        {
            'operator': 'eq',
            'operand': 'sector',
            'filter_type': 'categoric',
            'value': 'Technology'
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 1
    assert response_data['stocks'][0]['symbol'] == 'TECH_HIGH_VOL'


@patch.object(StockGetter, 'get_stocks')
def test_day_volume_range_filter(mock_get_stocks, api_client):
    """Test filtering stocks within a day volume range (min and max)"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'MID_VOL1',
            'shortName': 'Mid Volume Stock 1',
            'volume': 2500000,
            'regularMarketPrice': 75.0
        },
        {
            'symbol': 'MID_VOL2',
            'shortName': 'Mid Volume Stock 2',
            'volume': 3500000,
            'regularMarketPrice': 85.0
        }
    ]
    
    filters = [
        {
            'operator': 'gte',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 2000000
        },
        {
            'operator': 'lte',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 4000000
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 2


def test_invalid_filter_type(api_client):
    """Test that invalid filter_type returns appropriate error"""
    filters = [
        {
            'operator': 'gt',
            'operand': 'dayvolume',
            'filter_type': 'invalid_type',
            'value': 5000000
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 400
    response_data = response.json()
    assert 'error' in response_data


def test_missing_required_keys(api_client):
    """Test that missing required keys returns appropriate error"""
    filters = [
        {
            'operator': 'gt',
            'operand': 'dayvolume',
            # Missing 'filter_type' and 'value'
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 400
    response_data = response.json()
    assert 'error' in response_data
    assert 'missing keys' in response_data['error'].lower()


def test_invalid_json(api_client):
    """Test that invalid JSON returns appropriate error"""
    response = api_client.post(
        '/stocks/getfilteredstocks',
        'invalid json',
        content_type='application/json'
    )
    
    assert response.status_code == 400
    response_data = response.json()
    assert 'error' in response_data


def test_non_array_payload(api_client):
    """Test that non-array payload returns appropriate error"""
    filters = {
        'operator': 'gt',
        'operand': 'dayvolume',
        'filter_type': 'numeric',
        'value': 5000000
    }
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 400
    response_data = response.json()
    assert 'error' in response_data
    assert 'array' in response_data['error'].lower()


@patch.object(StockGetter, 'get_stocks')
def test_empty_filter_array(mock_get_stocks, api_client):
    """Test that empty filter array is handled properly"""
    mock_get_stocks.return_value = []
    
    filters = []
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 0


@patch.object(StockGetter, 'get_stocks')
def test_day_volume_with_zero_value(mock_get_stocks, api_client):
    """Test filtering stocks with day volume greater than zero (excluding non-traded stocks)"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'ACTIVE1',
            'shortName': 'Active Stock 1',
            'volume': 1000,
            'regularMarketPrice': 50.0
        },
        {
            'symbol': 'ACTIVE2',
            'shortName': 'Active Stock 2',
            'volume': 500,
            'regularMarketPrice': 30.0
        }
    ]
    
    filters = [
        {
            'operator': 'gt',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 0
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 2


@patch.object(StockGetter, 'get_stocks')
def test_day_volume_high_threshold(mock_get_stocks, api_client):
    """Test filtering with a very high volume threshold"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'MEGAVOL',
            'shortName': 'Mega Volume Stock',
            'volume': 100000000,
            'regularMarketPrice': 150.0
        }
    ]
    
    filters = [
        {
            'operator': 'gt',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 50000000
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] >= 1
    assert response_data['stocks'][0]['symbol'] == 'MEGAVOL'


@patch.object(StockGetter, 'get_stocks')
def test_multiple_numeric_filters(mock_get_stocks, api_client):
    """Test combining multiple numeric filters (volume + price)"""
    mock_get_stocks.return_value = [
        {
            'symbol': 'FILTERED1',
            'shortName': 'Filtered Stock 1',
            'volume': 5000000,
            'regularMarketPrice': 100.0
        }
    ]
    
    filters = [
        {
            'operator': 'gt',
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 1000000
        },
        {
            'operator': 'gte',
            'operand': 'intradayprice',
            'filter_type': 'numeric',
            'value': 50.0
        }
    ]
    
    response = api_client.post(
        '/stocks/getfilteredstocks',
        filters,
        format='json'
    )
    
    assert response.status_code == 200
    response_data = response.json()
    assert 'stocks' in response_data
    assert response_data['count'] == 1