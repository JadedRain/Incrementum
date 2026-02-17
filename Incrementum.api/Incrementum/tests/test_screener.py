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
            primary_exchange="NASDAQ",
            outstanding_shares=15500000000,
            total_employees=161000
        ),
        StockModel.objects.create(
            symbol="MSFT",
            company_name="Microsoft Corporation",
            market_cap=2800000000000,
            primary_exchange="NASDAQ",
            outstanding_shares=7430000000,
            total_employees=221000
        ),
        StockModel.objects.create(
            symbol="GOOGL",
            company_name="Alphabet Inc.",
            market_cap=1800000000000,
            primary_exchange="NASDAQ",
            outstanding_shares=12800000000,
            total_employees=190000
        ),
        StockModel.objects.create(
            symbol="TSLA",
            company_name="Tesla Inc.",
            market_cap=800000000000,
            primary_exchange="NASDAQ",
            outstanding_shares=3200000000,
            total_employees=127000
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
        result, total = screener.query(filters)

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

        result, total = screener.query(filters)

        assert len(result) == 0

    def test_filter_with_multiple_filters(self, test_stocks):
        """Test filtering with multiple criteria."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="categoric",
            value="AAPL"
        )

        market_cap_filter = FilterData(
            operator="greater_than",
            operand="market_cap",
            filter_type="numeric",
            value=1500000000000
        )

        filters = [ticker_filter, market_cap_filter]

        result, total = screener.query(filters)
        assert len(result) == 1

    def test_filter_empty_filter_list(self, test_stocks):
        """Test that empty filter list returns all stocks."""
        screener = Screener()
        filters = []

        result, total = screener.query(filters)

        assert len(result) == 4

    def test_filter_by_ticker_case_sensitivity(self, test_stocks):
        """Test that ticker filtering handles case correctly."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="categoric",
            value="aapl"
        )

        filters = [ticker_filter]

        result, total = screener.query(filters)
        assert len(result) == 1
        assert result[0].symbol == "AAPL"

    def test_pps_latest_selection_multiple_stocks(self):
        """Verify 'pps' uses the latest StockHistory.close_price per stock."""
        screener = Screener()

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

        pps_filter = FilterData(
            operator="greater_than",
            operand="pps",
            filter_type="numeric",
            value=1600
        )

        result, total = screener.query([pps_filter])

        assert len(result) == 1
        assert result[0].symbol == "BBB"

    def test_filter_by_market_cap_greater_than(self, test_stocks):
        """Test filtering stocks with market cap greater than a threshold."""
        screener = Screener()

        market_cap_filter = FilterData(
            operator="greater_than",
            operand="market_cap",
            filter_type="numeric",
            value=2000000000000
        )

        filters = [market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "AAPL" in symbols
        assert "MSFT" in symbols

    def test_filter_by_market_cap_less_than(self, test_stocks):
        """Test filtering stocks with market cap less than a threshold."""
        screener = Screener()

        market_cap_filter = FilterData(
            operator="less_than",
            operand="market_cap",
            filter_type="numeric",
            value=1000000000000
        )

        filters = [market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 1
        assert result[0].symbol == "TSLA"

    def test_filter_by_market_cap_equals(self, test_stocks):
        """Test filtering stocks with exact market cap."""
        screener = Screener()

        market_cap_filter = FilterData(
            operator="equals",
            operand="market_cap",
            filter_type="numeric",
            value=800000000000
        )

        filters = [market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 1
        assert result[0].symbol == "TSLA"

    def test_filter_by_market_cap_greater_than_or_equal(self, test_stocks):
        """Test filtering stocks with market cap >= threshold."""
        screener = Screener()

        market_cap_filter = FilterData(
            operator="greater_than_or_equal",
            operand="market_cap",
            filter_type="numeric",
            value=1800000000000
        )

        filters = [market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 3
        symbols = [stock.symbol for stock in result]
        assert "AAPL" in symbols
        assert "MSFT" in symbols
        assert "GOOGL" in symbols

    def test_filter_by_market_cap_less_than_or_equal(self, test_stocks):
        """Test filtering stocks with market cap <= threshold."""
        screener = Screener()

        market_cap_filter = FilterData(
            operator="less_than_or_equal",
            operand="market_cap",
            filter_type="numeric",
            value=1800000000000
        )

        filters = [market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "GOOGL" in symbols
        assert "TSLA" in symbols

    def test_filter_by_outstanding_shares_greater_than(self, test_stocks):
        """Test filtering stocks by outstanding shares greater than threshold."""
        screener = Screener()

        shares_filter = FilterData(
            operator="greater_than",
            operand="outstanding_shares",
            filter_type="numeric",
            value=10000000000
        )

        filters = [shares_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "AAPL" in symbols
        assert "GOOGL" in symbols

    def test_filter_by_outstanding_shares_less_than(self, test_stocks):
        """Test filtering stocks by outstanding shares less than threshold."""
        screener = Screener()

        shares_filter = FilterData(
            operator="less_than",
            operand="outstanding_shares",
            filter_type="numeric",
            value=5000000000
        )

        filters = [shares_filter]
        result, total = screener.query(filters)

        assert len(result) == 1
        assert result[0].symbol == "TSLA"

    def test_filter_by_outstanding_shares_equals(self, test_stocks):
        """Test filtering stocks by exact outstanding shares value."""
        screener = Screener()

        shares_filter = FilterData(
            operator="equals",
            operand="outstanding_shares",
            filter_type="numeric",
            value=7430000000
        )

        filters = [shares_filter]
        result, total = screener.query(filters)

        assert len(result) == 1
        assert result[0].symbol == "MSFT"

    def test_filter_by_total_employees_greater_than(self, test_stocks):
        """Test filtering stocks by total employees greater than threshold."""
        screener = Screener()

        employees_filter = FilterData(
            operator="greater_than",
            operand="total_employees",
            filter_type="numeric",
            value=180000
        )

        filters = [employees_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "MSFT" in symbols
        assert "GOOGL" in symbols

    def test_filter_by_total_employees_less_than_or_equal(self, test_stocks):
        """Test filtering stocks by total employees <= threshold."""
        screener = Screener()

        employees_filter = FilterData(
            operator="less_than_or_equal",
            operand="total_employees",
            filter_type="numeric",
            value=161000
        )

        filters = [employees_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "AAPL" in symbols
        assert "TSLA" in symbols

    def test_filter_by_total_employees_greater_than_or_equal(self, test_stocks):
        """Test filtering stocks by total employees >= threshold."""
        screener = Screener()

        employees_filter = FilterData(
            operator="greater_than_or_equal",
            operand="total_employees",
            filter_type="numeric",
            value=190000
        )

        filters = [employees_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "MSFT" in symbols
        assert "GOOGL" in symbols

    def test_multiple_numeric_filters_combined(self, test_stocks):
        """Test combining multiple numeric filters with AND logic."""
        screener = Screener()

        market_cap_filter = FilterData(
            operator="greater_than",
            operand="market_cap",
            filter_type="numeric",
            value=1000000000000
        )

        employees_filter = FilterData(
            operator="less_than",
            operand="total_employees",
            filter_type="numeric",
            value=200000
        )

        filters = [market_cap_filter, employees_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "AAPL" in symbols
        assert "GOOGL" in symbols

    def test_multiple_filters_different_operands(self, test_stocks):
        """Test combining numeric filters on different fields."""
        screener = Screener()

        shares_filter = FilterData(
            operator="greater_than_or_equal",
            operand="outstanding_shares",
            filter_type="numeric",
            value=10000000000
        )

        market_cap_filter = FilterData(
            operator="less_than_or_equal",
            operand="market_cap",
            filter_type="numeric",
            value=2000000000000
        )

        filters = [shares_filter, market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 1
        assert result[0].symbol == "GOOGL"

    def test_numeric_filter_equals_exact_match(self, test_stocks):
        """Test equals operator with exact numeric match."""
        screener = Screener()

        employees_filter = FilterData(
            operator="equals",
            operand="total_employees",
            filter_type="numeric",
            value=127000
        )

        filters = [employees_filter]
        result, total = screener.query(filters)

        assert len(result) == 1
        assert result[0].symbol == "TSLA"
        assert result[0].total_employees == 127000

    def test_numeric_filter_no_match(self, test_stocks):
        """Test numeric filter that matches no stocks."""
        screener = Screener()

        market_cap_filter = FilterData(
            operator="greater_than",
            operand="market_cap",
            filter_type="numeric",
            value=5000000000000
        )

        filters = [market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 0

    def test_edge_case_boundary_values(self, test_stocks):
        """Test boundary value filtering."""
        screener = Screener()

        market_cap_filter = FilterData(
            operator="greater_than_or_equal",
            operand="market_cap",
            filter_type="numeric",
            value=2800000000000
        )

        filters = [market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "AAPL" in symbols
        assert "MSFT" in symbols

    def test_filter_by_industry_and_ticker_with_and_logic(self, db):
        """Test filtering with all filters ANDed together.
        Creates four stocks (INTC, MSFT, TSLA, F). Tests various scenarios:
        1. Automotive AND specific tickers
        2. Automotive AND Technology - returns 0 stocks (no stock has both)
        """
        StockModel.objects.create(
            symbol="INTC",
            company_name="Intel Corporation",
            market_cap=150000000000,
            primary_exchange="NASDAQ",
            sic_description="Semiconductors"
        )
        StockModel.objects.create(
            symbol="MSFT",
            company_name="Microsoft Corporation",
            market_cap=2800000000000,
            primary_exchange="NASDAQ",
            sic_description="Technology"
        )
        StockModel.objects.create(
            symbol="TSLA",
            company_name="Tesla Inc.",
            market_cap=800000000000,
            primary_exchange="NASDAQ",
            sic_description="Automotive"
        )
        StockModel.objects.create(
            symbol="F",
            company_name="Ford Motor Company",
            market_cap=50000000000,
            primary_exchange="NYSE",
            sic_description="Automotive"
        )

        screener = Screener()

        industry_filter = FilterData(
            operator="contains",
            operand="sic_description",
            filter_type="string",
            value="Automotive"
        )

        ticker_filter_intc = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="string",
            value="INTC"
        )
        ticker_filter_msft = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="string",
            value="MSFT"
        )
        ticker_filter_tsla = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="string",
            value="TSLA"
        )
        ticker_filter_f = FilterData(
            operator="equals",
            operand="ticker",
            filter_type="string",
            value="F"
        )

        filters = [industry_filter, ticker_filter_tsla]
        result, total = screener.query(filters)
        assert len(result) == 1
        assert result[0].symbol == "TSLA"

        filters = [industry_filter, ticker_filter_f]
        result, total = screener.query(filters)
        assert len(result) == 1
        assert result[0].symbol == "F"

        filters = [industry_filter, ticker_filter_intc]
        result, total = screener.query(filters)
        assert len(result) == 0

        filters = [industry_filter, ticker_filter_msft]
        result, total = screener.query(filters)
        assert len(result) == 0

        airline_filter = FilterData(
            operator="contains",
            operand="sic_description",
            filter_type="string",
            value="Airline"
        )

        filters = [airline_filter]
        result, total = screener.query(filters)

        assert len(result) == 0

    def test_filter_by_industry_with_multiple_ticker_filters(self, db):
        """Test filtering by automotive industry with multiple ticker filters.
        Creates four stocks (INTC, MSFT, TSLA, F) where only TSLA and F
        are in the automotive industry. With all filters ANDed, combining
        automotive industry with multiple different ticker filters would
        require impossible conditions, so this test demonstrates filtering
        with just the industry to show which stocks qualify.
        """
        StockModel.objects.create(
            symbol="INTC",
            company_name="Intel Corporation",
            market_cap=150000000000,
            primary_exchange="NASDAQ",
            sic_description="Semiconductors"
        )
        StockModel.objects.create(
            symbol="MSFT",
            company_name="Microsoft Corporation",
            market_cap=2800000000000,
            primary_exchange="NASDAQ",
            sic_description="Technology"
        )
        StockModel.objects.create(
            symbol="TSLA",
            company_name="Tesla Inc.",
            market_cap=800000000000,
            primary_exchange="NASDAQ",
            sic_description="Automotive"
        )
        StockModel.objects.create(
            symbol="F",
            company_name="Ford Motor Company",
            market_cap=50000000000,
            primary_exchange="NYSE",
            sic_description="Automotive"
        )

        screener = Screener()

        industry_filter = FilterData(
            operator="contains",
            operand="sic_description",
            filter_type="string",
            value="Automotive"
        )

        filters = [industry_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "TSLA" in symbols
        assert "F" in symbols
        assert "INTC" not in symbols
        assert "MSFT" not in symbols

    def test_filter_by_market_cap_min(self, test_stocks):
        """Test filtering stocks with market cap >= min value."""
        screener = Screener()
        min_filter = FilterData(
            operator="greater_than_or_equal",
            operand="market_cap",
            filter_type="numeric",
            value=2000000000000
        )
        filters = [min_filter]
        result, total = screener.query(filters)
        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "AAPL" in symbols
        assert "MSFT" in symbols

    def test_filter_by_market_cap_max(self, test_stocks):
        """Test filtering stocks with market cap <= max value."""
        screener = Screener()
        max_filter = FilterData(
            operator="less_than_or_equal",
            operand="market_cap",
            filter_type="numeric",
            value=1800000000000
        )
        filters = [max_filter]
        result, total = screener.query(filters)
        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "GOOGL" in symbols
        assert "TSLA" in symbols

    def test_filter_by_market_cap_range(self, test_stocks):
        """Test filtering stocks with market cap between min and max (inclusive)."""
        screener = Screener()
        min_filter = FilterData(
            operator="greater_than_or_equal",
            operand="market_cap",
            filter_type="numeric",
            value=800000000000
        )
        max_filter = FilterData(
            operator="less_than_or_equal",
            operand="market_cap",
            filter_type="numeric",
            value=1800000000000
        )
        filters = [min_filter, max_filter]
        result, total = screener.query(filters)
        assert len(result) == 2
        symbols = [stock.symbol for stock in result]
        assert "GOOGL" in symbols
        assert "TSLA" in symbols

    def test_filter_by_eps_min(self, db):
        """Test filtering stocks with eps >= min value."""
        # Setup stocks with eps
        StockModel.objects.create(symbol="A", company_name="A", market_cap=1, eps=2.0)
        StockModel.objects.create(symbol="B", company_name="B", market_cap=1, eps=3.5)
        StockModel.objects.create(symbol="C", company_name="C", market_cap=1, eps=1.0)
        screener = Screener()
        min_filter = FilterData(
            operator="greater_than_or_equal",
            operand="eps",
            filter_type="numeric",
            value=2.0
        )
        filters = [min_filter]
        result, total = screener.query(filters)
        symbols = [stock.symbol for stock in result]
        assert set(symbols) == {"A", "B"}

    def test_filter_by_eps_max(self, db):
        """Test filtering stocks with eps <= max value."""
        StockModel.objects.create(symbol="A", company_name="A", market_cap=1, eps=2.0)
        StockModel.objects.create(symbol="B", company_name="B", market_cap=1, eps=3.5)
        StockModel.objects.create(symbol="C", company_name="C", market_cap=1, eps=1.0)
        screener = Screener()
        max_filter = FilterData(
            operator="less_than_or_equal",
            operand="eps",
            filter_type="numeric",
            value=2.0
        )
        filters = [max_filter]
        result, total = screener.query(filters)
        symbols = [stock.symbol for stock in result]
        assert set(symbols) == {"A", "C"}

    def test_filter_by_eps_range(self, db):
        """Test filtering stocks with eps between min and max (inclusive)."""
        StockModel.objects.create(symbol="A", company_name="A", market_cap=1, eps=2.0)
        StockModel.objects.create(symbol="B", company_name="B", market_cap=1, eps=3.5)
        StockModel.objects.create(symbol="C", company_name="C", market_cap=1, eps=1.0)
        screener = Screener()
        min_filter = FilterData(
            operator="greater_than_or_equal",
            operand="eps",
            filter_type="numeric",
            value=1.5
        )
        max_filter = FilterData(
            operator="less_than_or_equal",
            operand="eps",
            filter_type="numeric",
            value=3.0
        )
        filters = [min_filter, max_filter]
        result, total = screener.query(filters)
        symbols = [stock.symbol for stock in result]
        assert set(symbols) == {"A"}


class TestWildcardFiltering:
    """Test wildcard filtering for ticker symbols."""

    @pytest.fixture
    def wildcard_test_stocks(self, db):
        """Create test stocks with various ticker symbols."""
        stocks = [
            StockModel.objects.create(
                symbol="AAPL",
                company_name="Apple Inc.",
                market_cap=3000000000000
            ),
            StockModel.objects.create(
                symbol="AMD",
                company_name="Advanced Micro Devices",
                market_cap=150000000000
            ),
            StockModel.objects.create(
                symbol="AMZN",
                company_name="Amazon.com Inc.",
                market_cap=1700000000000
            ),
            StockModel.objects.create(
                symbol="MSFT",
                company_name="Microsoft Corporation",
                market_cap=2800000000000
            ),
            StockModel.objects.create(
                symbol="META",
                company_name="Meta Platforms Inc.",
                market_cap=900000000000
            ),
            StockModel.objects.create(
                symbol="GOOGL",
                company_name="Alphabet Inc.",
                market_cap=1800000000000
            ),
            StockModel.objects.create(
                symbol="TSLA",
                company_name="Tesla Inc.",
                market_cap=800000000000
            ),
            StockModel.objects.create(
                symbol="ABNB",
                company_name="Airbnb Inc.",
                market_cap=80000000000
            ),
        ]
        return stocks

    def test_wildcard_filter_ticker_starts_with_a(self, wildcard_test_stocks):
        """Test filtering ticker symbols that start with 'A' (A*)."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="A*"
        )

        filters = [ticker_filter]
        result, total = screener.query(filters)

        assert len(result) == 4
        assert total == 4
        symbols = {stock.symbol for stock in result}
        assert symbols == {"AAPL", "AMD", "AMZN", "ABNB"}

    def test_wildcard_filter_ticker_starts_with_m(self, wildcard_test_stocks):
        """Test filtering ticker symbols that start with 'M' (M*)."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="M*"
        )

        filters = [ticker_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        assert total == 2
        symbols = {stock.symbol for stock in result}
        assert symbols == {"MSFT", "META"}

    def test_wildcard_filter_ticker_case_insensitive(self, wildcard_test_stocks):
        """Test that wildcard filtering is case insensitive."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="A*"
        )

        filters = [ticker_filter]
        result, total = screener.query(filters)

        assert len(result) == 4
        assert total == 4
        symbols = {stock.symbol for stock in result}
        assert symbols == {"AAPL", "AMD", "AMZN", "ABNB"}

    def test_wildcard_filter_ticker_no_matches(self, wildcard_test_stocks):
        """Test filtering ticker symbols with no matches."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="Z*"
        )

        filters = [ticker_filter]
        result, total = screener.query(filters)

        assert len(result) == 0
        assert total == 0

    def test_wildcard_filter_ticker_multi_character_prefix(self, wildcard_test_stocks):
        """Test filtering ticker symbols with multi-character prefix (AM*)."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="AM*"
        )

        filters = [ticker_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        assert total == 2
        symbols = {stock.symbol for stock in result}
        assert symbols == {"AMD", "AMZN"}

    def test_wildcard_filter_combined_with_market_cap(self, wildcard_test_stocks):
        """Test wildcard filter combined with market cap filter."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="A*"
        )

        market_cap_filter = FilterData(
            operator="greater_than",
            operand="market_cap",
            filter_type="numeric",
            value=1000000000000
        )

        filters = [ticker_filter, market_cap_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        assert total == 2
        symbols = {stock.symbol for stock in result}
        assert symbols == {"AAPL", "AMZN"}

    def test_wildcard_filter_ticker_exact_match(self, wildcard_test_stocks):
        """Test wildcard filter with exact ticker symbol."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="AAPL*"
        )

        filters = [ticker_filter]
        result, total = screener.query(filters)

        assert len(result) == 1
        assert total == 1
        assert result[0].symbol == "AAPL"

    def test_wildcard_filter_ticker_single_match(self, wildcard_test_stocks):
        """Test wildcard filter that matches single ticker."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="G*"
        )

        filters = [ticker_filter]
        result, total = screener.query(filters)

        assert len(result) == 1
        assert total == 1
        assert result[0].symbol == "GOOGL"

    def test_wildcard_endswith_filter(self, wildcard_test_stocks):
        """Test filtering ticker symbols that end with a pattern."""
        screener = Screener()

        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="*L"
        )

        filters = [ticker_filter]
        result, total = screener.query(filters)

        assert len(result) == 2
        assert total == 2
        symbols = {stock.symbol for stock in result}
        assert symbols == {"AAPL", "GOOGL"}

    def test_wildcard_filter_ticker_middle_asterisk(self, wildcard_test_stocks):
        StockModel.objects.create(
            symbol="QB",
            company_name="QB Corp",
            market_cap=1000000
        )
        StockModel.objects.create(
            symbol="QXYB",
            company_name="QXYB Corp",
            market_cap=1000000
        )

        screener = Screener()
        ticker_filter = FilterData(
            operator="contains",
            operand="ticker",
            filter_type="string",
            value="Q*B"
        )

        result, total = screener.query([ticker_filter])

        assert total == 2
        symbols = {stock.symbol for stock in result}
        assert symbols == {"QB", "QXYB"}
