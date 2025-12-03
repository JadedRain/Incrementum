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
def test_get_filtered_stocks_basic(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'TEST1',
            'shortName': 'Test Stock 1',
            'regularMarketPrice': 100.0,
            'volume': 1000000
        }),
        Stock({
            'symbol': 'TEST2',
            'shortName': 'Test Stock 2',
            'regularMarketPrice': 150.0,
            'volume': 2000000
        })
    ]

    filters = []

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
def test_get_filtered_stocks_with_price_filter(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'EXPENSIVE',
            'shortName': 'Expensive Stock',
            'regularMarketPrice': 500.0
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'intradayprice',
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
    assert response_data['count'] == 1
    assert response_data['stocks']['quotes'][0]['symbol'] == 'EXPENSIVE'


@patch.object(StockGetter, 'get_stocks')
def test_get_filtered_stocks_with_multiple_filters(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MULTI',
            'shortName': 'Multi Filter Stock',
            'regularMarketPrice': 250.0,
            'volume': 5000000,
            'sector': 'Technology'
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
            'operand': 'dayvolume',
            'filter_type': 'numeric',
            'value': 1000000
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'MULTI'


@patch.object(StockGetter, 'get_stocks')
def test_get_filtered_stocks_empty_result(mock_get_stocks, api_client):
    mock_get_stocks.return_value = []

    filters = [
        {
            'operator': 'gt',
            'operand': 'intradayprice',
            'filter_type': 'numeric',
            'value': 10000
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


def test_get_filtered_stocks_invalid_filter(api_client):
    filters = [
        {
            'operator': 'invalid',
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

    assert response.status_code == 400
    response_data = response.json()
    assert 'error' in response_data


def test_get_filtered_stocks_missing_keys(api_client):
    filters = [
        {
            'operator': 'gt',
            # Missing 'operand', 'filter_type', and 'value'
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
