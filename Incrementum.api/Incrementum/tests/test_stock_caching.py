import pytest
from datetime import timedelta
from decimal import Decimal
from unittest.mock import Mock, patch
from django.test import TestCase
from django.utils import timezone

from Incrementum.models.stock import StockModel
from Incrementum.get_stock_info import (
    get_stock_by_ticker,
    fetch_stock_data,
    save_stock_data_to_db,
    stock_model_to_stock,
)


class TestStockCaching(TestCase):
    """Test suite for stock data caching functionality."""

    def setUp(self):
        """Set up test data before each test."""
        # Clear any existing test data
        StockModel.objects.all().delete()

    def tearDown(self):
        """Clean up after each test."""
        StockModel.objects.all().delete()

    def _create_mock_yfinance_data(self, symbol='AAPL'):
        """Create mock yfinance data for testing."""
        return {
            'symbol': symbol,
            'longName': f'{symbol} Inc.',
            'shortName': symbol,
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
            'fullExchangeName': 'NASDAQ',
            'industry': 'Technology',
            'sector': 'Technology',
            'country': 'US',
            'marketCap': 2500000000000,
            'volume': 80000000,
            'regularMarketVolume': 80000000,
            'averageVolume': 75000000,
            'averageDailyVolume3Month': 75000000,
            'regularMarketChangePercent': 1.01,
        }

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_first_fetch_saves_to_database(self, mock_ticker):
        """Test that first fetch from yfinance saves data to database."""
        mock_yfinance_data = self._create_mock_yfinance_data('AAPL')
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_yfinance_data
        mock_ticker.return_value = mock_ticker_instance

        self.assertFalse(StockModel.objects.filter(symbol='AAPL').exists())

        stock = get_stock_by_ticker('AAPL')

        self.assertEqual(stock.symbol, 'AAPL')
        self.assertTrue(StockModel.objects.filter(symbol='AAPL').exists())

        db_stock = StockModel.objects.get(symbol='AAPL')
        self.assertEqual(db_stock.company_name, 'AAPL Inc.')
        self.assertIsNotNone(db_stock.yfinance_data_updated_at)
        self.assertEqual(db_stock.current_price, Decimal('150.25'))
        self.assertEqual(db_stock.market_cap, 2500000000000)

        mock_ticker.assert_called_once_with('AAPL')

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_second_fetch_uses_cache_within_5_minutes(self, mock_ticker):
        """Test that second fetch within 5 minutes uses cached data."""
        mock_yfinance_data = self._create_mock_yfinance_data('MSFT')
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_yfinance_data
        mock_ticker.return_value = mock_ticker_instance

        stock1 = get_stock_by_ticker('MSFT')
        self.assertEqual(stock1.symbol, 'MSFT')

        mock_ticker.reset_mock()

        stock2 = get_stock_by_ticker('MSFT')

        self.assertEqual(stock2.symbol, 'MSFT')

        mock_ticker.assert_not_called()

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_fetch_after_5_minutes_updates_cache(self, mock_ticker):
        """Test that fetch after 5 minutes gets fresh data from yfinance."""
        old_time = timezone.now() - timedelta(minutes=6)
        StockModel.objects.create(
            symbol='GOOGL',
            company_name='Alphabet Inc.',
            yfinance_data_updated_at=old_time,
            current_price=Decimal('100.00'),
            market_cap=1000000000000,
        )

        mock_yfinance_data = self._create_mock_yfinance_data('GOOGL')
        mock_yfinance_data['currentPrice'] = 105.50
        mock_yfinance_data['regularMarketPrice'] = 105.50
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_yfinance_data
        mock_ticker.return_value = mock_ticker_instance

        stock = get_stock_by_ticker('GOOGL')
        self.assertEqual(stock.symbol, 'GOOGL')

        mock_ticker.assert_called_once_with('GOOGL')

        db_stock = StockModel.objects.get(symbol='GOOGL')
        self.assertEqual(db_stock.current_price, Decimal('105.50'))
        time_diff = timezone.now() - db_stock.yfinance_data_updated_at
        self.assertLess(time_diff.total_seconds(), 5)

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_fetch_with_no_timestamp_fetches_fresh_data(self, mock_ticker):
        """Test that stock with no yfinance_data_updated_at fetches fresh data."""
        StockModel.objects.create(
            symbol='TSLA',
            company_name='Tesla Inc.',
            yfinance_data_updated_at=None,
            current_price=None,
        )

        mock_yfinance_data = self._create_mock_yfinance_data('TSLA')
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_yfinance_data
        mock_ticker.return_value = mock_ticker_instance

        stock = get_stock_by_ticker('TSLA')

        self.assertEqual(stock.symbol, 'TSLA')
        mock_ticker.assert_called_once_with('TSLA')

        db_stock = StockModel.objects.get(symbol='TSLA')
        self.assertIsNotNone(db_stock.yfinance_data_updated_at)
        self.assertIsNotNone(db_stock.current_price)

    def test_save_stock_data_to_db_creates_new_stock(self):
        """Test that save_stock_data_to_db creates a new stock."""
        mock_data = self._create_mock_yfinance_data('AMZN')

        stock_model = save_stock_data_to_db(mock_data)

        self.assertEqual(stock_model.symbol, 'AMZN')
        self.assertEqual(stock_model.company_name, 'AMZN Inc.')
        self.assertIsNotNone(stock_model.yfinance_data_updated_at)
        self.assertEqual(stock_model.current_price, Decimal('150.25'))

    def test_save_stock_data_to_db_updates_existing_stock(self):
        """Test that save_stock_data_to_db updates existing stock."""
        old_time = timezone.now() - timedelta(hours=1)
        StockModel.objects.create(
            symbol='NFLX',
            company_name='Netflix Inc.',
            yfinance_data_updated_at=old_time,
            current_price=Decimal('200.00'),
        )

        mock_data = self._create_mock_yfinance_data('NFLX')
        mock_data['currentPrice'] = 250.00

        stock_model = save_stock_data_to_db(mock_data)

        self.assertEqual(stock_model.symbol, 'NFLX')
        self.assertEqual(stock_model.current_price, Decimal('250.00'))
        self.assertGreater(stock_model.yfinance_data_updated_at, old_time)

        self.assertEqual(StockModel.objects.filter(symbol='NFLX').count(), 1)

    def test_stock_model_to_stock_conversion(self):
        """Test converting StockModel to Stock object."""
        stock_model = StockModel.objects.create(
            symbol='META',
            company_name='Meta Platforms Inc.',
            current_price=Decimal('300.50'),
            open_price=Decimal('299.00'),
            previous_close=Decimal('298.00'),
            day_high=Decimal('302.00'),
            day_low=Decimal('297.00'),
            fifty_day_average=Decimal('290.00'),
            market_cap=800000000000,
            volume=50000000,
            average_volume=45000000,
            exchange='NMS',
            industry='Technology',
            sector='Communication Services',
            country='US',
        )

        stock = stock_model_to_stock(stock_model)

        self.assertEqual(stock.symbol, 'META')
        self.assertEqual(stock.currentPrice, 300.50)
        self.assertEqual(stock.marketCap, 800000000000)
        self.assertEqual(stock.exchange, 'NMS')

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_cache_expiry_exactly_5_minutes(self, mock_ticker):
        """Test cache behavior at exactly 5 minutes."""
        exactly_5_min_ago = timezone.now() - timedelta(minutes=5)
        StockModel.objects.create(
            symbol='NVDA',
            company_name='NVIDIA Corporation',
            yfinance_data_updated_at=exactly_5_min_ago,
            current_price=Decimal('500.00'),
        )

        mock_yfinance_data = self._create_mock_yfinance_data('NVDA')
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_yfinance_data
        mock_ticker.return_value = mock_ticker_instance

        get_stock_by_ticker('NVDA')

        mock_ticker.assert_called_once()

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_fetch_with_missing_optional_fields(self, mock_ticker):
        """Test fetching stock with missing optional fields."""
        minimal_data = {
            'symbol': 'TEST',
            'longName': 'Test Company',
            'regularMarketPrice': 50.00,
        }
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = minimal_data
        mock_ticker.return_value = mock_ticker_instance

        stock = get_stock_by_ticker('TEST')

        self.assertEqual(stock.symbol, 'TEST')

        db_stock = StockModel.objects.get(symbol='TEST')
        self.assertEqual(db_stock.company_name, 'Test Company')
        self.assertIsNone(db_stock.market_cap)
        self.assertIsNone(db_stock.exchange)

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_fetch_stock_data_handles_invalid_ticker(self, mock_ticker):
        """Test that fetch_stock_data handles invalid ticker gracefully."""
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = {}
        mock_ticker.return_value = mock_ticker_instance

        with self.assertRaises(ValueError) as context:
            fetch_stock_data('INVALID')

        self.assertIn('Unable to fetch valid data', str(context.exception))

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_case_insensitive_symbol_lookup(self, mock_ticker):
        """Test that symbol lookup is case-insensitive."""
        old_time = timezone.now() - timedelta(minutes=2)
        StockModel.objects.create(
            symbol='AAPL',
            company_name='Apple Inc.',
            yfinance_data_updated_at=old_time,
            current_price=Decimal('150.00'),
        )

        stock = get_stock_by_ticker('aapl')

        self.assertEqual(stock.symbol, 'AAPL')
        mock_ticker.assert_not_called()

    @patch('Incrementum.get_stock_info.yf.Ticker')
    def test_multiple_consecutive_fetches(self, mock_ticker):
        """Test multiple consecutive fetches within cache period."""
        mock_yfinance_data = self._create_mock_yfinance_data('IBM')
        mock_ticker_instance = Mock()
        mock_ticker_instance.info = mock_yfinance_data
        mock_ticker.return_value = mock_ticker_instance

        for i in range(5):
            stock = get_stock_by_ticker('IBM')
            self.assertEqual(stock.symbol, 'IBM')

        self.assertEqual(mock_ticker.call_count, 1)

    def test_decimal_conversion_handles_various_types(self):
        """Test that decimal conversion handles various input types."""
        test_data = {
            'symbol': 'TEST',
            'longName': 'Test',
            'regularMarketPrice': 100,
            'currentPrice': '150.50',
            'open': 149.99,
            'marketCap': 1000000000000,
        }

        stock_model = save_stock_data_to_db(test_data)

        self.assertEqual(stock_model.current_price, Decimal('150.50'))
        self.assertEqual(stock_model.market_cap, 1000000000000)


@pytest.mark.django_db
class TestStockCachingIntegration:
    """Integration tests for stock caching with actual database."""

    def test_end_to_end_caching_workflow(self):
        """Test complete workflow: fetch, cache, retrieve, refresh."""
        StockModel.objects.all().delete()

        with patch('Incrementum.get_stock_info.yf.Ticker') as mock_ticker:
            mock_data = {
                'symbol': 'ORCL',
                'longName': 'Oracle Corporation',
                'regularMarketPrice': 100.00,
                'currentPrice': 100.00,
                'marketCap': 300000000000,
            }
            mock_ticker_instance = Mock()
            mock_ticker_instance.info = mock_data
            mock_ticker.return_value = mock_ticker_instance

            stock1 = get_stock_by_ticker('ORCL')
            assert stock1.symbol == 'ORCL'
            assert mock_ticker.call_count == 1

            mock_ticker.reset_mock()
            stock2 = get_stock_by_ticker('ORCL')
            assert stock2.symbol == 'ORCL'
            assert mock_ticker.call_count == 0

            db_stock = StockModel.objects.get(symbol='ORCL')
            db_stock.yfinance_data_updated_at = timezone.now() - timedelta(minutes=10)
            db_stock.save()

            mock_data['currentPrice'] = 105.00
            stock3 = get_stock_by_ticker('ORCL')
            assert stock3.symbol == 'ORCL'
            assert mock_ticker.call_count == 1

            db_stock.refresh_from_db()
            assert db_stock.current_price == Decimal('105.00')
