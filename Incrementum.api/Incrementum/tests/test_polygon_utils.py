import os
import pytest
from unittest.mock import patch, MagicMock
from Incrementum.models.stock import StockModel

from Incrementum.utils import (
    fetch_new_stocks_from_polygon,
    update_stocks_in_db_from_polygon,
    fetch_and_update_symbols,
)


# Test fetch_new_stocks_from_polygon
@patch('Incrementum.utils.RESTClient')
def test_fetch_new_stocks_from_polygon_returns_data(mock_rest_client):
    # Mock the polygon client
    mock_client_instance = MagicMock()
    mock_rest_client.return_value = mock_client_instance

    # Create mock ticker objects
    mock_ticker1 = MagicMock()
    mock_ticker1.ticker = 'MOCK1'
    mock_ticker1.name = 'Mock Company One'
    mock_ticker1.market = 'stocks'
    mock_ticker1.locale = 'us'
    mock_ticker1.type = 'CS'
    mock_ticker1.primary_exchange = 'NASDAQ'
    mock_ticker1.currency_name = 'USD'

    mock_ticker2 = MagicMock()
    mock_ticker2.ticker = 'MOCK2'
    mock_ticker2.name = 'Mock Company Two'
    mock_ticker2.market = 'stocks'
    mock_ticker2.locale = 'us'
    mock_ticker2.type = 'CS'
    mock_ticker2.primary_exchange = 'NYSE'
    mock_ticker2.currency_name = 'USD'

    mock_client_instance.list_tickers.return_value = [mock_ticker1, mock_ticker2]

    os.environ['POLYGON_API_KEY'] = 'dummy-key'
    data = fetch_new_stocks_from_polygon()
    assert isinstance(data, list)
    assert data[0]['symbol'] == 'MOCK1'
    assert data[0]['name'] == 'Mock Company One'
    assert data[1]['symbol'] == 'MOCK2'
    assert data[1]['name'] == 'Mock Company Two'


@patch('Incrementum.utils.RESTClient')
def test_fetch_new_stocks_from_polygon_empty_response(mock_rest_client):
    mock_client_instance = MagicMock()
    mock_rest_client.return_value = mock_client_instance
    mock_client_instance.list_tickers.return_value = []

    os.environ['POLYGON_API_KEY'] = 'dummy-key'
    data = fetch_new_stocks_from_polygon()
    assert data == []


@patch('Incrementum.utils.RESTClient')
def test_fetch_new_stocks_from_polygon_missing_key(mock_rest_client):
    os.environ.pop('POLYGON_API_KEY', None)
    print(f"TEST DEBUG: POLYGON_API_KEY value: '{os.environ.get('POLYGON_API_KEY')}'")
    data = fetch_new_stocks_from_polygon()
    assert not mock_rest_client.called
    assert data == []


@patch('Incrementum.utils.RESTClient')
def test_fetch_new_stocks_from_polygon_whitespace_key(mock_rest_client):
    os.environ['POLYGON_API_KEY'] = '   '
    data = fetch_new_stocks_from_polygon()
    assert not mock_rest_client.called
    assert data == []


# Test update_stocks_in_db
@pytest.mark.django_db
@patch('Incrementum.utils.RESTClient')
def test_update_stocks_in_db_adds_and_updates(mock_rest_client):
    # Mock the polygon client and its response
    mock_client_instance = MagicMock()
    mock_rest_client.return_value = mock_client_instance

    # Mock ticker details for MCK1
    mock_details1 = MagicMock()
    mock_details1.name = 'Mock One'
    mock_details1.description = None
    mock_details1.market_cap = None
    mock_details1.primary_exchange = None
    mock_details1.type = None
    mock_details1.currency_name = None
    mock_details1.cik = None
    mock_details1.composite_figi = None
    mock_details1.share_class_figi = None
    mock_details1.weighted_shares_outstanding = None
    mock_details1.homepage_url = None
    mock_details1.total_employees = None
    mock_details1.list_date = None
    mock_details1.locale = None
    mock_details1.sic_code = None
    mock_details1.sic_description = None

    # Mock ticker details for MCK2
    mock_details2 = MagicMock()
    mock_details2.name = 'Mock Two'
    mock_details2.description = None
    mock_details2.market_cap = None
    mock_details2.primary_exchange = None
    mock_details2.type = None
    mock_details2.currency_name = None
    mock_details2.cik = None
    mock_details2.composite_figi = None
    mock_details2.share_class_figi = None
    mock_details2.weighted_shares_outstanding = None
    mock_details2.homepage_url = None
    mock_details2.total_employees = None
    mock_details2.list_date = None
    mock_details2.locale = None
    mock_details2.sic_code = None
    mock_details2.sic_description = None

    # Configure mock to return different details based on ticker
    def get_ticker_details_side_effect(ticker):
        if ticker == 'MCK1':
            return mock_details1
        elif ticker == 'MCK2':
            return mock_details2

    mock_client_instance.get_ticker_details.side_effect = get_ticker_details_side_effect

    os.environ['POLYGON_API_KEY'] = 'dummy-key'
    StockModel.objects.all().delete()

    # Use valid symbol and company_name lengths
    mock_data = [
        {'symbol': 'MCK1', 'name': 'Mock One'},
        {'symbol': 'MCK2', 'name': 'Mock Two'}
    ]
    update_stocks_in_db_from_polygon(mock_data)
    assert StockModel.objects.filter(symbol='MCK1', company_name='Mock One').exists()
    assert StockModel.objects.filter(symbol='MCK2', company_name='Mock Two').exists()

    # Update company names
    mock_details1.name = 'Mock Uno'
    mock_details2.name = 'Mock Dos'
    mock_data = [
        {'symbol': 'MCK1', 'name': 'Mock Uno'},
        {'symbol': 'MCK2', 'name': 'Mock Dos'}
    ]
    update_stocks_in_db_from_polygon(mock_data)
    assert StockModel.objects.filter(symbol='MCK1', company_name='Mock Uno').exists()
    assert StockModel.objects.filter(symbol='MCK2', company_name='Mock Dos').exists()


@pytest.mark.django_db
def test_update_stocks_in_db_empty():
    StockModel.objects.all().delete()
    update_stocks_in_db_from_polygon([])
    assert StockModel.objects.count() == 0


@pytest.mark.django_db
@patch('Incrementum.utils.RESTClient')
def test_fetch_and_update_symbols_empty_response(mock_rest_client):
    mock_client_instance = MagicMock()
    mock_rest_client.return_value = mock_client_instance
    mock_client_instance.list_tickers.return_value = []

    os.environ['POLYGON_API_KEY'] = 'dummy-key'
    StockModel.objects.all().delete()
    fetch_and_update_symbols()
    assert StockModel.objects.count() == 0


@pytest.mark.django_db
@patch('Incrementum.utils.RESTClient')
def test_fetch_and_update_symbols_missing_key(mock_rest_client):
    os.environ.pop('POLYGON_API_KEY', None)
    StockModel.objects.all().delete()
    fetch_and_update_symbols()
    # Should not call RESTClient
    assert not mock_rest_client.called
    assert StockModel.objects.count() == 0
