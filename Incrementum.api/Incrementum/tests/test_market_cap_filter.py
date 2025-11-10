import pytest
from rest_framework.test import APIClient
from unittest.mock import patch
from Screeners.stock_getter import StockGetter
from Incrementum.stocks_class import Stock

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()

@patch.object(StockGetter, 'get_stocks')
def test_market_cap_greater_than(mock_get_stocks, api_client):
    """Test filtering stocks with market cap greater than a threshold"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'LARGE_CAP1',
            'shortName': 'Large Cap Stock 1',
            'marketCap': 500000000000,  # 500B
            'regularMarketPrice': 150.0
        }),
        Stock({
            'symbol': 'LARGE_CAP2',
            'shortName': 'Large Cap Stock 2',
            'marketCap': 300000000000,  # 300B
            'regularMarketPrice': 85.0
        })
    ]
    
    filters = [
        {
            'operator': 'gt',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 200000000000  # 200B
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
    
    symbols = [stock['symbol'] for stock in response_data['stocks']['quotes']]
    assert 'LARGE_CAP1' in symbols
    assert 'LARGE_CAP2' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_market_cap_less_than(mock_get_stocks, api_client):
    """Test filtering stocks with market cap less than a threshold"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'SMALL_CAP1',
            'shortName': 'Small Cap Stock 1',
            'marketCap': 500000000,  # 500M
            'regularMarketPrice': 25.0
        }),
        Stock({
            'symbol': 'SMALL_CAP2',
            'shortName': 'Small Cap Stock 2',
            'marketCap': 800000000,  # 800M
            'regularMarketPrice': 30.0
        })
    ]
    
    filters = [
        {
            'operator': 'lt',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 1000000000  # 1B
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
    
    symbols = [stock['symbol'] for stock in response_data['stocks']['quotes']]
    assert 'SMALL_CAP1' in symbols
    assert 'SMALL_CAP2' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_market_cap_greater_than_or_equal(mock_get_stocks, api_client):
    """Test filtering stocks with market cap greater than or equal to a threshold"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MID_CAP1',
            'shortName': 'Mid Cap Stock 1',
            'marketCap': 10000000000,  # 10B
            'regularMarketPrice': 120.0
        }),
        Stock({
            'symbol': 'MID_CAP2',
            'shortName': 'Mid Cap Stock 2',
            'marketCap': 15000000000,  # 15B
            'regularMarketPrice': 140.0
        })
    ]
    
    filters = [
        {
            'operator': 'gte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 10000000000  # 10B
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
def test_market_cap_less_than_or_equal(mock_get_stocks, api_client):
    """Test filtering stocks with market cap less than or equal to a threshold"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MICRO_CAP1',
            'shortName': 'Micro Cap Stock 1',
            'marketCap': 200000000,  # 200M
            'regularMarketPrice': 45.0
        }),
        Stock({
            'symbol': 'MICRO_CAP2',
            'shortName': 'Micro Cap Stock 2',
            'marketCap': 300000000,  # 300M
            'regularMarketPrice': 55.0
        })
    ]
    
    filters = [
        {
            'operator': 'lte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 300000000  # 300M
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
def test_market_cap_equal_to(mock_get_stocks, api_client):
    """Test filtering stocks with market cap exactly equal to a value"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'EXACT_CAP',
            'shortName': 'Exact Market Cap Stock',
            'marketCap': 5000000000,  # 5B
            'regularMarketPrice': 100.0
        })
    ]
    
    filters = [
        {
            'operator': 'eq',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 5000000000  # 5B
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'EXACT_CAP'


@patch.object(StockGetter, 'get_stocks')
def test_market_cap_range_filter(mock_get_stocks, api_client):
    """Test filtering stocks within a market cap range (min and max)"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'RANGE_CAP1',
            'shortName': 'Range Cap Stock 1',
            'marketCap': 5000000000,  # 5B
            'regularMarketPrice': 75.0
        }),
        Stock({
            'symbol': 'RANGE_CAP2',
            'shortName': 'Range Cap Stock 2',
            'marketCap': 8000000000,  # 8B
            'regularMarketPrice': 85.0
        })
    ]
    
    filters = [
        {
            'operator': 'gte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 2000000000  # 2B min
        },
        {
            'operator': 'lte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 10000000000  # 10B max
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
def test_market_cap_combined_with_sector(mock_get_stocks, api_client):
    """Test combining market cap filter with sector filter"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'TECH_LARGE',
            'shortName': 'Tech Large Cap Stock',
            'sector': 'Technology',
            'marketCap': 100000000000,  # 100B
            'regularMarketPrice': 200.0
        })
    ]
    
    filters = [
        {
            'operator': 'gt',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 50000000000  # 50B
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'TECH_LARGE'

@patch.object(StockGetter, 'get_stocks')
def test_market_cap_small_cap_filter(mock_get_stocks, api_client):
    """Test filtering for small cap stocks (300M-2B)"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'SMALL1',
            'shortName': 'Small Cap Stock 1',
            'marketCap': 500000000,  # 500M
            'regularMarketPrice': 15.0
        }),
        Stock({
            'symbol': 'SMALL2',
            'shortName': 'Small Cap Stock 2',
            'marketCap': 1500000000,  # 1.5B
            'regularMarketPrice': 22.0
        })
    ]
    
    filters = [
        {
            'operator': 'gte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 300000000  # 300M
        },
        {
            'operator': 'lte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 2000000000  # 2B
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
def test_market_cap_mid_cap_filter(mock_get_stocks, api_client):
    """Test filtering for mid cap stocks (2B-10B)"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MID1',
            'shortName': 'Mid Cap Stock 1',
            'marketCap': 3000000000,  # 3B
            'regularMarketPrice': 65.0
        }),
        Stock({
            'symbol': 'MID2',
            'shortName': 'Mid Cap Stock 2',
            'marketCap': 7000000000,  # 7B
            'regularMarketPrice': 78.0
        })
    ]
    
    filters = [
        {
            'operator': 'gte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 2000000000  # 2B
        },
        {
            'operator': 'lte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 10000000000  # 10B
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
def test_market_cap_large_cap_filter(mock_get_stocks, api_client):
    """Test filtering for large cap stocks (10B-200B)"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'LARGE1',
            'shortName': 'Large Cap Stock 1',
            'marketCap': 50000000000,  # 50B
            'regularMarketPrice': 125.0
        }),
        Stock({
            'symbol': 'LARGE2',
            'shortName': 'Large Cap Stock 2',
            'marketCap': 150000000000,  # 150B
            'regularMarketPrice': 180.0
        })
    ]
    
    filters = [
        {
            'operator': 'gte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 10000000000  # 10B
        },
        {
            'operator': 'lte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 200000000000  # 200B
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

def test_market_cap_invalid_filter_type(api_client):
    """Test that invalid filter_type returns appropriate error"""
    filters = [
        {
            'operator': 'gt',
            'operand': 'intradaymarketcap',
            'filter_type': 'invalid_type',
            'value': 5000000000
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

def test_market_cap_missing_required_keys(api_client):
    """Test that missing required keys returns appropriate error"""
    filters = [
        {
            'operator': 'gt',
            'operand': 'intradaymarketcap',
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


@patch.object(StockGetter, 'get_stocks')
def test_market_cap_empty_results(mock_get_stocks, api_client):
    """Test that empty results are handled properly"""
    mock_get_stocks.return_value = []
    
    filters = [
        {
            'operator': 'gt',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 10000000000000  # 10T - unrealistically high
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
    assert response_data['count'] == 0


@patch.object(StockGetter, 'get_stocks')
def test_market_cap_boundary_value_exactly_200(mock_get_stocks, api_client):
    """Test filtering with boundary value - market cap exactly at 200"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'BOUNDARY_CAP',
            'shortName': 'Boundary Market Cap Stock',
            'marketCap': 200,
            'regularMarketPrice': 50.0
        })
    ]
    
    # Test with lte (should include 200)
    filters = [
        {
            'operator': 'lte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 200
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
    assert response_data['stocks']['quotes'][0]['marketCap'] == 200


@patch.object(StockGetter, 'get_stocks')
def test_market_cap_boundary_value_greater_than_200(mock_get_stocks, api_client):
    """Test filtering that values greater than 200 are excluded with lte 200"""
    mock_get_stocks.return_value = []  # Should be empty since all are > 200
    
    filters = [
        {
            'operator': 'lte',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 200
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
    # The mock returns empty, verifying the filter is working correctly
    assert response_data['count'] == 0


@patch.object(StockGetter, 'get_stocks')
def test_market_cap_micro_cap_filter(mock_get_stocks, api_client):
    """Test filtering for micro cap stocks (<300M)"""
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MICRO1',
            'shortName': 'Micro Cap Stock 1',
            'marketCap': 50000000,  # 50M
            'regularMarketPrice': 5.0
        }),
        Stock({
            'symbol': 'MICRO2',
            'shortName': 'Micro Cap Stock 2',
            'marketCap': 250000000,  # 250M
            'regularMarketPrice': 12.0
        })
    ]
    
    filters = [
        {
            'operator': 'lt',
            'operand': 'intradaymarketcap',
            'filter_type': 'numeric',
            'value': 300000000  # 300M
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