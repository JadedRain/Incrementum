import pytest
from unittest.mock import patch

from hello.get_stock_info import screen_stocks_by_current_share_price


class DummyStock:
    def __init__(self, symbol):
        self.symbol = symbol


def make_quote(symbol, price, **extra):
    q = {"symbol": symbol, "regularMarketPrice": price}
    q.update(extra)
    return q


@patch('hello.get_stock_info.fetch_stock_data')
@patch('hello.get_stock_info.yf')
def test_filter_used_correctly(mock_yf, mock_fetch):
    # prepare mocked screen result
    mock_yf.screen.return_value = {"quotes": [
        make_quote('AAPL', 185.32),
        make_quote('MSFT', 330.10),
        make_quote('TSLA', 245.60),
        make_quote('NVDA', 470.00),
    ]}

    mock_fetch.side_effect = lambda s: DummyStock(s)

    # gt -> values greater than 300
    res = screen_stocks_by_current_share_price('gt', 300, max_results=50)
    assert {s.symbol for s in res} == {'MSFT', 'NVDA'}

    # eq -> exact match
    res = screen_stocks_by_current_share_price('eq', 330.10, max_results=50)
    assert {s.symbol for s in res} == {'MSFT'}


@patch('hello.get_stock_info.fetch_stock_data')
@patch('hello.get_stock_info.yf')
def test_filter_with_other_fields(mock_yf, mock_fetch):
    # include extra fields that should be ignored by the price filter
    mock_yf.screen.return_value = {"quotes": [
        make_quote('AAPL', 185.32, percentchange=0.5),
        make_quote('MSFT', 330.10, avgdailyvol3m=2000000),
    ]}
    mock_fetch.side_effect = lambda s: DummyStock(s)

    res = screen_stocks_by_current_share_price('lte', 330.10, max_results=50)
    assert {s.symbol for s in res} == {'AAPL', 'MSFT'}


def test_invalid_filter_raises():
    with pytest.raises(ValueError):
        screen_stocks_by_current_share_price('not_a_filter', 100)


@patch('hello.get_stock_info.fetch_stock_data')
@patch('hello.get_stock_info.yf')
def test_min_but_no_max(mock_yf, mock_fetch):
    mock_yf.screen.return_value = {"quotes": [
        make_quote('AAPL', 185.32),
        make_quote('TSLA', 245.60),
        make_quote('MSFT', 330.10),
    ]}
    mock_fetch.side_effect = lambda s: DummyStock(s)

    # min only -> use gte
    res = screen_stocks_by_current_share_price('gte', 240, max_results=50)
    assert {s.symbol for s in res} == {'TSLA', 'MSFT'}


@patch('hello.get_stock_info.fetch_stock_data')
@patch('hello.get_stock_info.yf')
def test_max_but_no_min(mock_yf, mock_fetch):
    mock_yf.screen.return_value = {"quotes": [
        make_quote('AAPL', 185.32),
        make_quote('TSLA', 245.60),
        make_quote('MSFT', 330.10),
    ]}
    mock_fetch.side_effect = lambda s: DummyStock(s)

    # max only -> use lte
    res = screen_stocks_by_current_share_price('lte', 250, max_results=50)
    assert {s.symbol for s in res} == {'AAPL', 'TSLA'}


@patch('hello.get_stock_info.fetch_stock_data')
@patch('hello.get_stock_info.yf')
def test_both_min_and_max_via_intersection(mock_yf, mock_fetch):
    # Use same underlying quotes; the range is emulated by intersecting two calls
    mock_yf.screen.return_value = {"quotes": [
        make_quote('AAPL', 185.32),
        make_quote('TSLA', 245.60),
        make_quote('MSFT', 330.10),
        make_quote('NVDA', 470.00),
    ]}
    mock_fetch.side_effect = lambda s: DummyStock(s)

    min_val = 200
    max_val = 350
    res_min = screen_stocks_by_current_share_price('gte', min_val, max_results=50)
    res_max = screen_stocks_by_current_share_price('lte', max_val, max_results=50)

    symbols_min = {s.symbol for s in res_min}
    symbols_max = {s.symbol for s in res_max}
    intersection = symbols_min.intersection(symbols_max)

    assert intersection == {'TSLA', 'MSFT'}