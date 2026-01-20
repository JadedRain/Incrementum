import pytest
from Incrementum.screener import Screener
from Incrementum.DTOs.ifilterdata import FilterData
from Incrementum.models.stock import StockModel

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
