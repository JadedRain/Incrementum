import pytest
from Screeners.stock import Stock
from Screeners.moving_average_52 import MovingAverage52Weeks
from Screeners.numeric_screeners import NumericScreeners

@pytest.fixture
def sample_stocks():
    return [
        Stock("AAPL", pe=28, market_cap=2e12, close_prices=[150+i for i in range(60)]),
        Stock("MSFT", pe=35, market_cap=1.8e12, close_prices=[300-i for i in range(60)]),
        Stock("TSLA", pe=100, market_cap=900e9, close_prices=[700+i for i in range(60)]),
    ]

def test_stock_creation():
    s = Stock("GOOGL", pe=25, market_cap=1.5e12)
    assert s.symbol == "GOOGL"
    assert s.pe == 25
    assert s.market_cap == 1.5e12
    assert s.close_prices == []

def test_moving_average_screener(sample_stocks):
    ma_screener = MovingAverage52Weeks()
    filtered = ma_screener.screen(sample_stocks)
    # Check that filtered stocks are above their 52-week MA
    for stock in filtered:
        ma52 = sum(stock.close_prices[-52:]) / 52
        assert stock.close_prices[-1] > ma52

def test_numeric_screeners_pipeline(sample_stocks):
    ma_screener = MovingAverage52Weeks()
    numeric = NumericScreeners([ma_screener])
    filtered = numeric.apply_screenings(sample_stocks)
    # Check the filtered list matches using the screener directly
    direct_filtered = ma_screener.screen(sample_stocks)
    assert filtered == direct_filtered
