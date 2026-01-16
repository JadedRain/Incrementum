import pytest
from datetime import timedelta
from decimal import Decimal
from unittest.mock import Mock, patch
from django.utils import timezone

from Incrementum.models.stock import StockModel
from Incrementum.get_stock_info import get_stock_by_ticker


@pytest.mark.django_db
class TestYfinanceDataIsUpdated:
    """Test suite verifying yfinance data updates."""

    def setup_method(self):
        """Clear test data before each test."""
        StockModel.objects.all().delete()

    def teardown_method(self):
        """Clean up after each test."""
        StockModel.objects.all().delete()

    def _create_mock_yfinance_data(self, symbol='TEST', price=100.00):
        """Helper to create mock yfinance response."""
        return {
            'symbol': symbol,
            'longName': f'{symbol} Corporation',
            'shortName': symbol,
            'currentPrice': price,
            'regularMarketPrice': price,
            'open': price - 1.0,
            'previousClose': price - 2.0,
            'dayHigh': price + 1.0,
            'dayLow': price - 3.0,
            'fiftyDayAverage': price - 5.0,
            'fiftyTwoWeekHigh': price + 20.0,
            'fiftyTwoWeekLow': price - 20.0,
            'exchange': 'NMS',
            'fullExchangeName': 'NASDAQ',
            'industry': 'Technology',
            'sector': 'Technology',
            'country': 'US',
            'marketCap': 1000000000000,
            'volume': 50000000,
            'regularMarketVolume': 50000000,
            'averageVolume': 45000000,
            'averageDailyVolume3Month': 45000000,
            'regularMarketChangePercent': 1.5,
        }

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_yfinance_data_timestamp_is_set(self, mock_ticker):
        """Test that yfinance_data_updated_at is set when fetching data."""
        mock_data = self._create_mock_yfinance_data('AAPL', 150.00)
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_data
        mock_ticker.return_value = mock_ticker_instance

        get_stock_by_ticker('AAPL')

        stock = StockModel.objects.get(symbol='AAPL')
        assert stock.yfinance_data_updated_at is not None
        assert (timezone.now() - stock.yfinance_data_updated_at).total_seconds() < 5

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_yfinance_data_is_saved_to_database(self, mock_ticker):
        """Test that all yfinance data fields are saved to database."""
        mock_data = self._create_mock_yfinance_data('MSFT', 300.00)
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_data
        mock_ticker.return_value = mock_ticker_instance

        get_stock_by_ticker('MSFT')

        stock = StockModel.objects.get(symbol='MSFT')
        assert stock.current_price == Decimal('300.00')
        assert stock.open_price == Decimal('299.00')
        assert stock.previous_close == Decimal('298.00')
        assert stock.day_high == Decimal('301.00')
        assert stock.day_low == Decimal('297.00')
        assert stock.fifty_day_average == Decimal('295.00')
        assert stock.market_cap == 1000000000000
        assert stock.volume == 50000000
        assert stock.average_volume == 45000000
        assert stock.exchange == 'NMS'
        assert stock.industry == 'Technology'
        assert stock.sector == 'Technology'

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_yfinance_data_is_updated_when_stale(self, mock_ticker):
        """Test that stale yfinance data is refreshed."""
        old_time = timezone.now() - timedelta(minutes=10)
        StockModel.objects.create(
            symbol='GOOGL',
            company_name='Alphabet Inc.',
            yfinance_data_updated_at=old_time,
            current_price=Decimal('100.00'),
            market_cap=1000000000000,
        )

        mock_data = self._create_mock_yfinance_data('GOOGL', 110.00)
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_data
        mock_ticker.return_value = mock_ticker_instance

        get_stock_by_ticker('GOOGL')

        stock = StockModel.objects.get(symbol='GOOGL')
        assert stock.current_price == Decimal('110.00')
        assert stock.yfinance_data_updated_at > old_time
        assert (timezone.now() - stock.yfinance_data_updated_at).total_seconds() < 5

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_yfinance_timestamp_not_updated_when_using_cache(self, mock_ticker):
        """Test that timestamp doesn't change when using cached data."""
        mock_data = self._create_mock_yfinance_data('TSLA', 200.00)
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_data
        mock_ticker.return_value = mock_ticker_instance

        get_stock_by_ticker('TSLA')
        stock_first = StockModel.objects.get(symbol='TSLA')
        first_timestamp = stock_first.yfinance_data_updated_at

        mock_ticker.reset_mock()
        get_stock_by_ticker('TSLA')

        stock_second = StockModel.objects.get(symbol='TSLA')
        assert stock_second.yfinance_data_updated_at == first_timestamp
        assert mock_ticker.call_count == 0

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_all_yfinance_fields_stored_correctly(self, mock_ticker):
        """Test comprehensive storage of all yfinance fields."""
        mock_data = {
            'symbol': 'AMZN',
            'longName': 'Amazon.com Inc.',
            'shortName': 'Amazon',
            'currentPrice': 150.25,
            'regularMarketPrice': 150.25,
            'open': 149.50,
            'previousClose': 148.75,
            'dayHigh': 151.00,
            'dayLow': 149.00,
            'fiftyDayAverage': 145.50,
            'fiftyTwoWeekHigh': 180.00,
            'fiftyTwoWeekLow': 120.00,
            'exchange': 'NMS',
            'fullExchangeName': 'NasdaqGS',
            'industry': 'Internet Retail',
            'sector': 'Consumer Cyclical',
            'country': 'United States',
            'marketCap': 1500000000000,
            'volume': 75000000,
            'regularMarketVolume': 75000000,
            'averageVolume': 70000000,
            'averageDailyVolume3Month': 70000000,
            'regularMarketChangePercent': 1.01,
        }
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_data
        mock_ticker.return_value = mock_ticker_instance

        get_stock_by_ticker('AMZN')

        stock = StockModel.objects.get(symbol='AMZN')
        assert stock.company_name == 'Amazon.com Inc.'
        assert stock.current_price == Decimal('150.25')
        assert stock.open_price == Decimal('149.50')
        assert stock.previous_close == Decimal('148.75')
        assert stock.day_high == Decimal('151.00')
        assert stock.day_low == Decimal('149.00')
        assert stock.fifty_day_average == Decimal('145.50')
        assert stock.fifty_two_week_high == Decimal('180.00')
        assert stock.fifty_two_week_low == Decimal('120.00')
        assert stock.exchange == 'NMS'
        assert stock.full_exchange_name == 'NasdaqGS'
        assert stock.industry == 'Internet Retail'
        assert stock.sector == 'Consumer Cyclical'
        assert stock.country == 'United States'
        assert stock.market_cap == 1500000000000
        assert stock.volume == 75000000
        assert stock.average_volume == 70000000
        assert stock.regular_market_change_percent == Decimal('1.01')
        assert stock.yfinance_data_updated_at is not None

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_update_overwrites_old_data(self, mock_ticker):
        """Test that updates completely overwrite old data."""
        old_time = timezone.now() - timedelta(minutes=10)
        StockModel.objects.create(
            symbol='NFLX',
            company_name='Netflix Inc.',
            yfinance_data_updated_at=old_time,
            current_price=Decimal('200.00'),
            market_cap=80000000000,
            volume=30000000,
            exchange='OLD',
        )

        mock_data = self._create_mock_yfinance_data('NFLX', 250.00)
        mock_data['exchange'] = 'NEW'
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_data
        mock_ticker.return_value = mock_ticker_instance

        get_stock_by_ticker('NFLX')

        stock = StockModel.objects.get(symbol='NFLX')
        assert stock.current_price == Decimal('250.00')
        assert stock.market_cap == 1000000000000
        assert stock.volume == 50000000
        assert stock.exchange == 'NEW'
        assert stock.yfinance_data_updated_at > old_time
