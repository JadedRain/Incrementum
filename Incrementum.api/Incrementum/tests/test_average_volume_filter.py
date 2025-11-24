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
def test_average_volume_greater_than(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
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

    filters = [
        {
            'operator': 'gt',
            'operand': 'avgdailyvol3m',
            'filter_type': 'numeric',
            'value': 10000000
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
    assert 'HIGH_VOL1' in symbols
    assert 'HIGH_VOL2' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_average_volume_less_than(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
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

    filters = [
        {
            'operator': 'lt',
            'operand': 'avgdailyvol3m',
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

    symbols = [stock['symbol'] for stock in response_data['stocks']['quotes']]
    assert 'LOW_VOL1' in symbols
    assert 'LOW_VOL2' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_average_volume_greater_than_or_equal(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
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

    filters = [
        {
            'operator': 'gte',
            'operand': 'avgdailyvol3m',
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
def test_average_volume_less_than_or_equal(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'LTE_VOL1',
            'shortName': 'LTE Volume Stock 1',
            'averageVolume': 2000000,
            'regularMarketPrice': 45.0
        }),
        Stock({
            'symbol': 'LTE_VOL2',
            'shortName': 'LTE Volume Stock 2',
            'averageVolume': 3000000,
            'regularMarketPrice': 55.0
        })
    ]

    filters = [
        {
            'operator': 'lte',
            'operand': 'avgdailyvol3m',
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
def test_average_volume_equal_to(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'EXACT_VOL',
            'shortName': 'Exact Volume Stock',
            'averageVolume': 5000000,
            'regularMarketPrice': 100.0
        })
    ]

    filters = [
        {
            'operator': 'eq',
            'operand': 'avgdailyvol3m',
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'EXACT_VOL'


@patch.object(StockGetter, 'get_stocks')
def test_average_volume_combined_with_sector(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'TECH_HIGH_VOL',
            'shortName': 'Tech High Volume Stock',
            'sector': 'Technology',
            'averageVolume': 10000000,
            'regularMarketPrice': 200.0
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'avgdailyvol3m',
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'TECH_HIGH_VOL'


@patch.object(StockGetter, 'get_stocks')
def test_average_volume_range_filter(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MID_VOL1',
            'shortName': 'Mid Volume Stock 1',
            'averageVolume': 2500000,
            'regularMarketPrice': 75.0
        }),
        Stock({
            'symbol': 'MID_VOL2',
            'shortName': 'Mid Volume Stock 2',
            'averageVolume': 3500000,
            'regularMarketPrice': 85.0
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'avgdailyvol3m',
            'filter_type': 'numeric',
            'value': 2000000
        },
        {
            'operator': 'lte',
            'operand': 'avgdailyvol3m',
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
    filters = [
        {
            'operator': 'gt',
            'operand': 'avgdailyvol3m',
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
            'operand': 'avgdailyvol3m',
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
    response = api_client.post(
        '/stocks/getfilteredstocks',
        'invalid json',
        content_type='application/json'
    )

    assert response.status_code == 400
    response_data = response.json()
    assert 'error' in response_data


def test_non_array_payload(api_client):
    filters = {
        'operator': 'gt',
        'operand': 'avgdailyvol3m',
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
def test_average_volume_with_zero_value(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'ACTIVE1',
            'shortName': 'Active Stock 1',
            'averageVolume': 1000,
            'regularMarketPrice': 50.0
        }),
        Stock({
            'symbol': 'ACTIVE2',
            'shortName': 'Active Stock 2',
            'averageVolume': 500,
            'regularMarketPrice': 30.0
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'avgdailyvol3m',
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
def test_average_volume_high_threshold(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MEGAVOL',
            'shortName': 'Mega Volume Stock',
            'averageVolume': 100000000,
            'regularMarketPrice': 150.0
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'avgdailyvol3m',
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'MEGAVOL'


@patch.object(StockGetter, 'get_stocks')
def test_multiple_numeric_filters(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'FILTERED1',
            'shortName': 'Filtered Stock 1',
            'averageVolume': 5000000,
            'regularMarketPrice': 100.0
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'avgdailyvol3m',
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
