import os
import pytest
from unittest.mock import patch
from hello.models import StockModel

from hello.utils import fetch_new_stocks_from_finnhub, update_stocks_in_db_from_finnhub, fetch_and_update_symbols


# Test fetch_new_stocks_from_finnhub
@patch('hello.utils.requests.get')
def test_fetch_new_stocks_from_finnhub_returns_data(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = [
        {'symbol': 'MOCK1', 'description': 'Mock Company One'},
        {'symbol': 'MOCK2', 'description': 'Mock Company Two'}
    ]
    os.environ['FINNHUB_TOKEN'] = 'dummy-token'
    data = fetch_new_stocks_from_finnhub()
    assert isinstance(data, list)
    assert data[0]['symbol'] == 'MOCK1'
    assert data[1]['description'] == 'Mock Company Two'

@patch('hello.utils.requests.get')
def test_fetch_new_stocks_from_finnhub_empty_response(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = []
    os.environ['FINNHUB_TOKEN'] = 'dummy-token'
    data = fetch_new_stocks_from_finnhub()
    assert data == []

@patch('hello.utils.requests.get')
def test_fetch_new_stocks_from_finnhub_missing_token(mock_get):
    os.environ.pop('FINNHUB_TOKEN', None)
    print(f"TEST DEBUG: FINNHUB_TOKEN value: '{os.environ.get('FINNHUB_TOKEN')}'")
    data = fetch_new_stocks_from_finnhub()
    assert not mock_get.called
    assert data == []

@patch('hello.utils.requests.get')
def test_fetch_new_stocks_from_finnhub_whitespace_token(mock_get):
    os.environ['FINNHUB_TOKEN'] = '   '
    data = fetch_new_stocks_from_finnhub()
    assert not mock_get.called
    assert data == []

# Test update_stocks_in_db
@pytest.mark.django_db
def test_update_stocks_in_db_adds_and_updates():
    StockModel.objects.all().delete()
    # Use valid symbol and company_name lengths
    mock_data = [
        {'symbol': 'MCK1', 'description': 'Mock One'},
        {'symbol': 'MCK2', 'description': 'Mock Two'}
    ]
    update_stocks_in_db_from_finnhub(mock_data)
    assert StockModel.objects.filter(symbol='MCK1', company_name='Mock One').exists()
    assert StockModel.objects.filter(symbol='MCK2', company_name='Mock Two').exists()

    # Update company names
    mock_data = [
        {'symbol': 'MCK1', 'description': 'Mock Uno'},
        {'symbol': 'MCK2', 'description': 'Mock Dos'}
    ]
    update_stocks_in_db_from_finnhub(mock_data)
    assert StockModel.objects.filter(symbol='MCK1', company_name='Mock Uno').exists()
    assert StockModel.objects.filter(symbol='MCK2', company_name='Mock Dos').exists()

@pytest.mark.django_db
def test_update_stocks_in_db_empty():
    StockModel.objects.all().delete()
    update_stocks_in_db_from_finnhub([])
    assert StockModel.objects.count() == 0

@pytest.mark.django_db
@patch('hello.utils.requests.get')
def test_fetch_and_update_symbols_empty_response(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = []
    os.environ['FINNHUB_TOKEN'] = 'dummy-token'
    StockModel.objects.all().delete()
    fetch_and_update_symbols()
    assert StockModel.objects.count() == 0

@pytest.mark.django_db
@patch('hello.utils.requests.get')
def test_fetch_and_update_symbols_missing_token(mock_get):
    os.environ.pop('FINNHUB_TOKEN', None)
    StockModel.objects.all().delete()
    fetch_and_update_symbols()
    # Should not call requests.get
    assert not mock_get.called
    assert StockModel.objects.count() == 0
