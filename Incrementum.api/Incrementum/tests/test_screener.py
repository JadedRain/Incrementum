import pytest
from Incrementum.screener import Screener
from Incrementum.DTOs.ifilterdata import FilterData
from Incrementum.models.stock import StockModel
from Incrementum.models.stock_history import StockHistory
from datetime import datetime, timedelta, timezone as dt_timezone

pytestmark = pytest.mark.django_db


@pytest.fixture
def test_stocks(db):
    """Create test stocks in the database."""
    stocks = [
        StockModel.objects.create(
            symbol="AAPL",
            company_name="Apple Inc.",
            market_cap=3000000000000,
            primary_exchange="NASDAQ"
        ),
        StockModel.objects.create(
            symbol="MSFT",
            company_name="Microsoft Corporation",
            market_cap=2800000000000,
            primary_exchange="NASDAQ"
        ),
        StockModel.objects.create(
            symbol="GOOGL",
            company_name="Alphabet Inc.",
            market_cap=1800000000000,
            primary_exchange="NASDAQ"
        ),
        StockModel.objects.create(
            symbol="TSLA",
            company_name="Tesla Inc.",
            market_cap=800000000000,
            primary_exchange="NASDAQ"
        ),
    ]
    return stocks


class TestScreener:
    def test_filter_by_ticker_symbol(self, test_stocks):
        """Test that filtering by ticker symbol returns only matching stocks."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="string",
            value="AAPL"
        )

        filters = [ticker_filter]
        result = screener.query(filters)

        assert len(result) == 1
        assert result[0].symbol == "AAPL"

    def test_filter_by_ticker_no_match(self, test_stocks):
        """Test that filtering returns empty list when no stocks match."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="string",
            value="NOTFOUND"
        )

        filters = [ticker_filter]

        result = screener.query(filters)

        assert len(result) == 0

    def test_filter_with_multiple_filters(self, test_stocks):
        """Test filtering with multiple criteria."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="string",
            value="AAPL"
        )

        price_filter = FilterData(
            operator="greater_than",
            operand="price",
            filter_type="numeric",
            value=100
        )

        filters = [ticker_filter, price_filter]

        result = screener.query(filters)
        assert len(result) == 1

    def test_filter_empty_filter_list(self, test_stocks):
        """Test that empty filter list returns all stocks."""
        screener = Screener()
        filters = []

        result = screener.query(filters)

        assert len(result) == 4

    def test_filter_by_ticker_case_sensitivity(self, test_stocks):
        """Test that ticker filtering handles case correctly."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="string",
            value="aapl"
        )

        filters = [ticker_filter]

        result = screener.query(filters)
        assert len(result) == 1
        assert result[0].symbol == "AAPL"

    def test_pps_latest_selection_multiple_stocks(self):
        """Verify 'pps' uses the latest StockHistory.close_price per stock."""
        screener = Screener()

        # Create two stocks
        stock_a = StockModel.objects.create(
            symbol="AAA",
            company_name="Company A"
        )
        stock_b = StockModel.objects.create(
            symbol="BBB",
            company_name="Company B"
        )

        newer = datetime(2025, 12, 26, 12, 0, tzinfo=dt_timezone.utc)
        older = newer - timedelta(hours=2)

        # Stock A: older close 1200, newer close 1500
        StockHistory.objects.create(
            stock_symbol=stock_a,
            day_and_time=older,
            open_price=1150,
            close_price=1200,
            high=1250,
            low=1100,
            volume=1000
        )
        StockHistory.objects.create(
            stock_symbol=stock_a,
            day_and_time=newer,
            open_price=1450,
            close_price=1500,
            high=1550,
            low=1400,
            volume=1200
        )

        # Stock B: older close 1700, newer close 1800
        StockHistory.objects.create(
            stock_symbol=stock_b,
            day_and_time=older,
            open_price=1650,
            close_price=1700,
            high=1750,
            low=1600,
            volume=900
        )
        StockHistory.objects.create(
            stock_symbol=stock_b,
            day_and_time=newer,
            open_price=1750,
            close_price=1800,
            high=1850,
            low=1700,
            volume=1100
        )

        # Filter for pps > 1600 should return only BBB (latest 1800)
        pps_filter = FilterData(
            operator="greater_than",
            operand="pps",
            filter_type="numeric",
            value=1600
        )

        result = screener.query([pps_filter])

        assert len(result) == 1
        assert result[0].symbol == "BBB"
