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
def test_percent_change_greater_than(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'GAINER1',
            'shortName': 'Gainer Stock 1',
            'regularMarketChangePercent': 7.5,
            'regularMarketPrice': 100.0
        }),
        Stock({
            'symbol': 'GAINER2',
            'shortName': 'Gainer Stock 2',
            'regularMarketChangePercent': 6.2,
            'regularMarketPrice': 50.0
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': 5.0
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
    assert 'GAINER1' in symbols
    assert 'GAINER2' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_percent_change_less_than(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'LOSER1',
            'shortName': 'Declining Stock 1',
            'regularMarketChangePercent': -3.5,
            'regularMarketPrice': 25.0
        }),
        Stock({
            'symbol': 'LOSER2',
            'shortName': 'Declining Stock 2',
            'regularMarketChangePercent': -2.8,
            'regularMarketPrice': 30.0
        })
    ]

    filters = [
        {
            'operator': 'lt',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': -2.0
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
    assert 'LOSER1' in symbols
    assert 'LOSER2' in symbols


@patch.object(StockGetter, 'get_stocks')
def test_percent_change_greater_than_or_equal(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'GTE_CHANGE1',
            'shortName': 'GTE Change Stock 1',
            'regularMarketChangePercent': 3.0,
            'regularMarketPrice': 120.0
        }),
        Stock({
            'symbol': 'GTE_CHANGE2',
            'shortName': 'GTE Change Stock 2',
            'regularMarketChangePercent': 4.5,
            'regularMarketPrice': 140.0
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': 3.0
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
def test_percent_change_less_than_or_equal(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'LTE_CHANGE1',
            'shortName': 'LTE Change Stock 1',
            'regularMarketChangePercent': -1.5,
            'regularMarketPrice': 45.0
        }),
        Stock({
            'symbol': 'LTE_CHANGE2',
            'shortName': 'LTE Change Stock 2',
            'regularMarketChangePercent': 0.5,
            'regularMarketPrice': 55.0
        })
    ]

    filters = [
        {
            'operator': 'lte',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': 0.5
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
def test_percent_change_equal_to(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'EXACT_CHANGE',
            'shortName': 'Exact Change Stock',
            'regularMarketChangePercent': 5.0,
            'regularMarketPrice': 100.0
        })
    ]

    filters = [
        {
            'operator': 'eq',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': 5.0
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'EXACT_CHANGE'


@patch.object(StockGetter, 'get_stocks')
def test_percent_change_combined_with_sector(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'TECH_GAINER',
            'shortName': 'Tech Gainer Stock',
            'sector': 'Technology',
            'regularMarketChangePercent': 8.5,
            'regularMarketPrice': 200.0
        })
    ]

    filters = [
        {
            'operator': 'gt',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': 5.0
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
    assert response_data['stocks']['quotes'][0]['symbol'] == 'TECH_GAINER'


@patch.object(StockGetter, 'get_stocks')
def test_percent_change_range_filter(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'MID_CHANGE1',
            'shortName': 'Mid Change Stock 1',
            'regularMarketChangePercent': 2.5,
            'regularMarketPrice': 75.0
        }),
        Stock({
            'symbol': 'MID_CHANGE2',
            'shortName': 'Mid Change Stock 2',
            'regularMarketChangePercent': 3.5,
            'regularMarketPrice': 85.0
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': 2.0
        },
        {
            'operator': 'lte',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': 4.0
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
            'operand': 'percentchange',
            'filter_type': 'invalid_type',
            'value': 5.0
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
            'operand': 'percentchange',
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
        'operand': 'percentchange',
        'filter_type': 'numeric',
        'value': 5.0
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
def test_percent_change_positive_boundary(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'BOUNDARY1',
            'shortName': 'Boundary Stock 1',
            'regularMarketChangePercent': 10.0,
            'regularMarketPrice': 50.0
        })
    ]

    filters = [
        {
            'operator': 'gte',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': 10.0
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


@patch.object(StockGetter, 'get_stocks')
def test_percent_change_negative_boundary(mock_get_stocks, api_client):
    mock_get_stocks.return_value = [
        Stock({
            'symbol': 'NEGATIVE1',
            'shortName': 'Negative Stock 1',
            'regularMarketChangePercent': -10.0,
            'regularMarketPrice': 30.0
        })
    ]

    filters = [
        {
            'operator': 'lte',
            'operand': 'percentchange',
            'filter_type': 'numeric',
            'value': -10.0
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
