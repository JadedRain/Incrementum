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
def test_current_share_price_greater_than(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MSFT',
            'shortName': 'Microsoft Corp.',
            'regularMarketPrice': 330.10
        }),
        Stock({
            'symbol': 'TSLA',
            'shortName': 'Tesla Inc.',
            'regularMarketPrice': 245.60
        }),
        Stock({
            'symbol': 'NVDA',
            'shortName': 'NVIDIA Corporation',
            'regularMarketPrice': 470.00
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'intradayprice',
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
    assert response_data['count'] == 3

    symbols = [stock['symbol'] for stock in response_data['stocks']['quotes']]
    assert 'MSFT' in symbols
    assert 'TSLA' in symbols
    assert 'NVDA' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_current_share_price_less_than(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'AAPL',
            'shortName': 'Apple Inc.',
            'regularMarketPrice': 185.32
        })
    ]

    filters = [
        {
            'operator': 'lt',
            'operand': 'intradayprice',
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'AAPL'


@patch.object(StockGetter, 'get_stocks')
def test_current_share_price_range_filter(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'AAPL',
            'shortName': 'Apple Inc.',
            'regularMarketPrice': 185.32
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'intradayprice',
            'filter_type': 'numeric',
            'value': 200
        },
        {
            'operator': 'gt',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
            'filter_type': 'numeric',
            'value': 450
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'AAPL'


@patch.object(StockGetter, 'get_stocks')
def test_current_share_price_greater_than_or_equal(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MID1',
            'shortName': 'Mid Price Stock 1',
            'regularMarketPrice': 240.00
        }),
        Stock({
            'symbol': 'MID2',
            'shortName': 'Mid Price Stock 2',
            'regularMarketPrice': 250.00
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'intradayprice',
            'filter_type': 'numeric',
            'value': 240
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
def test_current_share_price_less_than_or_equal(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'LOW1',
            'shortName': 'Low Price Stock 1',
            'regularMarketPrice': 50.00
        }),
        Stock({
            'symbol': 'LOW2',
            'shortName': 'Low Price Stock 2',
            'regularMarketPrice': 75.00
        })
    ]

    filters = [
        {
            'operator': 'lte',
            'operand': 'intradayprice',
            'filter_type': 'numeric',
            'value': 100
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
def test_current_share_price_equal_to(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'EXACT_PRICE',
            'shortName': 'Exact Price Stock',
            'regularMarketPrice': 100.00
        })
    ]

    filters = [
        {
            'operator': 'eq',
            'operand': 'intradayprice',
            'filter_type': 'numeric',
            'value': 100.00
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'EXACT_PRICE'


@patch.object(StockGetter, 'get_stocks')
def test_current_share_price_combined_with_52_week_high(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'NVDA',
            'shortName': 'NVIDIA Corporation',
            'regularMarketPrice': 470.00,
            'fiftyTwoWeekHigh': 495.00
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'intradayprice',
            'filter_type': 'numeric',
            'value': 240
        },
        {
            'operator': 'lte',
            'operand': 'intradayprice',
            'filter_type': 'numeric',
            'value': 500
        },
        {
            'operator': 'gt',
            'operand': '52weekhigh',
            'filter_type': 'numeric',
            'value': 490
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'NVDA'


def test_invalid_filter_type(api_client):
    filters = [
        {
            'operator': 'gt',
            'operand': 'intradayprice',
            'filter_type': 'invalid_type',
            'value': 100
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
    filters = [
        {
            'operator': 'gt',
            'operand': 'intradayprice',
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
        'operand': 'intradayprice',
        'filter_type': 'numeric',
        'value': 100
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
