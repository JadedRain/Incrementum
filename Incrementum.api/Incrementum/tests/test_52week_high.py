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
def test_52_week_high_greater_than(mock_get_stocks, api_client):
    # Mock should return only stocks that pass the filter (52-week high > 490)
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'NVDA',
            'shortName': 'NVIDIA Corporation',
            'fiftyTwoWeekHigh': 495.00,
            'regularMarketPrice': 470.00
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
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


@patch.object(StockGetter, 'get_stocks')
def test_52_week_high_less_than(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'AAPL',
            'shortName': 'Apple Inc.',
            'fiftyTwoWeekHigh': 190.12,
            'regularMarketPrice': 185.32
        }),
        Stock({
            'symbol': 'SMALL1',
            'shortName': 'Small Stock 1',
            'fiftyTwoWeekHigh': 150.00,
            'regularMarketPrice': 145.00
        })
    ]

    filters = [
        {
            'operator': 'lt',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
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
    assert response_data['count'] == 2

    symbols = [stock['symbol'] for stock in response_data['stocks']['quotes']]
    assert 'AAPL' in symbols
    assert 'SMALL1' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_52_week_high_greater_than_or_equal(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MSFT',
            'shortName': 'Microsoft Corp.',
            'fiftyTwoWeekHigh': 360.00,
            'regularMarketPrice': 330.10
        }),
        Stock({
            'symbol': 'NVDA',
            'shortName': 'NVIDIA Corporation',
            'fiftyTwoWeekHigh': 495.00,
            'regularMarketPrice': 470.00
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
            'filter_type': 'numeric',
            'value': 360
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
def test_52_week_high_less_than_or_equal(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'SMALL1',
            'shortName': 'Small Stock 1',
            'fiftyTwoWeekHigh': 100.00,
            'regularMarketPrice': 95.00
        }),
        Stock({
            'symbol': 'SMALL2',
            'shortName': 'Small Stock 2',
            'fiftyTwoWeekHigh': 150.00,
            'regularMarketPrice': 145.00
        })
    ]

    filters = [
        {
            'operator': 'lte',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
            'filter_type': 'numeric',
            'value': 150
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
def test_52_week_high_equal_to(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'EXACT_HIGH',
            'shortName': 'Exact High Stock',
            'fiftyTwoWeekHigh': 250.00,
            'regularMarketPrice': 245.00
        })
    ]

    filters = [
        {
            'operator': 'eq',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
            'filter_type': 'numeric',
            'value': 250.00
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'EXACT_HIGH'


@patch.object(StockGetter, 'get_stocks')
def test_52_week_high_range_filter(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MID1',
            'shortName': 'Mid Range Stock 1',
            'fiftyTwoWeekHigh': 300.00,
            'regularMarketPrice': 290.00
        }),
        Stock({
            'symbol': 'MID2',
            'shortName': 'Mid Range Stock 2',
            'fiftyTwoWeekHigh': 350.00,
            'regularMarketPrice': 340.00
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
            'filter_type': 'numeric',
            'value': 250
        },
        {
            'operator': 'lte',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
            'filter_type': 'numeric',
            'value': 400
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
def test_52_week_high_combined_with_sector(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'TECH_HIGH',
            'shortName': 'Tech High Stock',
            'sector': 'Technology',
            'fiftyTwoWeekHigh': 500.00,
            'regularMarketPrice': 480.00
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
            'filter_type': 'numeric',
            'value': 450
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'TECH_HIGH'


def test_invalid_filter_type(api_client):
    filters = [
        {
            'operator': 'gt',
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
            'filter_type': 'invalid_type',
            'value': 250
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
            'operand': 'lastclose52weekhigh.lasttwelvemonths',
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
        'operand': 'lastclose52weekhigh.lasttwelvemonths',
        'filter_type': 'numeric',
        'value': 250
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
