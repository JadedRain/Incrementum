import pytest
from unittest.mock import patch
from Screeners.stock import Stock
from hello.get_stock_info import get_stock_info
import pandas as pd

# Sample tickers
sample_tickers = pd.DataFrame({
    "symbol": ["AAPL", "MSFT", "TSLA"],
    "sectorKey": ["Technology", "Technology", "Automotive"],
    "industryKey": ["Software", "Software", "EV"]
})

def mock_source():
    return sample_tickers

# Mock fetch_stock_data with controlled historical prices
def mock_fetch_stock_data(symbol):
    if symbol == "AAPL":
        # Last price above MA
        prices = [100 + i for i in range(60)]  # increasing trend
    elif symbol == "MSFT":
        # Last price below MA
        prices = [200 - i for i in range(60)]  # decreasing trend
    else:
        # Random / irrelevant
        prices = [50 + i for i in range(60)]
    return Stock(symbol=symbol, close_prices=prices)

@pytest.fixture
def filters():
    return {
        "price_52w_high": True,
        "price_52w_high_value": 0  # placeholder, ignored
    }

@patch("hello.get_stock_info.fetch_stock_data", side_effect=mock_fetch_stock_data)
def test_ma_filter(mock_fetch, filters):
    stocks = get_stock_info(
        max=10,
        offset=0,
        filters=filters,
        source=mock_source
    )

    # Only AAPL should pass the 52-week MA filter
    symbols = [s.symbol for s in stocks]
    assert symbols == ["AAPL", "TSLA"], f"Stocks returned: {symbols}"

    # Check that all returned stocks have last price above MA
    for s in stocks:
        ma52 = sum(s.close_prices[-52:]) / 52
        assert s.close_prices[-1] > ma52
