import pytest
from datetime import datetime
from django.test import TestCase
from Incrementum.models.stock import StockModel
from Incrementum.models.stock_history import StockHistory
from Incrementum.views.user_stock_potential import calculate_stock_price_difference


@pytest.mark.django_db(transaction=True)
class TestCalculateStockPriceDifference(TestCase):

    def _create_stock_with_history(self, symbol, purchase_close, latest_close):
        """Helper method to create stock and history records"""
        stock = StockModel.objects.create(
            symbol=symbol,
            company_name=f'{symbol} Company',
            price=latest_close * 100  # Store price in cents to match the function's expectation
        )

        purchase_date = datetime(2024, 1, 1, 12, 0, 0)
        latest_date = datetime(2024, 1, 15, 12, 0, 0)

        StockHistory.objects.create(
            stock_symbol=stock,
            day_and_time=purchase_date,
            open_price=purchase_close - 1,
            close_price=purchase_close,
            high=purchase_close + 5,
            low=purchase_close - 5,
            volume=1000000
        )

        StockHistory.objects.create(
            stock_symbol=stock,
            day_and_time=latest_date,
            open_price=latest_close - 1,
            close_price=latest_close,
            high=latest_close + 5,
            low=latest_close - 5,
            volume=1000000
        )

        return stock, purchase_close

    def test_calculate_difference_with_price_increase(self):
        """Test calculation when price increased"""
        stock, purchase_date = self._create_stock_with_history('TEST1', 100, 110)
        quantity = 10
        # old_price (100) - new_price (110) = -10, -10 * 10 = -100
        result = calculate_stock_price_difference(stock, purchase_date, quantity)
        assert result == -100

    def test_calculate_difference_with_price_decrease(self):
        """Test calculation when price decreased"""
        stock, purchase_date = self._create_stock_with_history('TEST2', 100, 90)
        quantity = 10
        # old_price (100) - new_price (90) = 10, 10 * 10 = 100
        result = calculate_stock_price_difference(stock, purchase_date, quantity)
        assert result == 100

    def test_calculate_difference_with_quantity_one(self):
        """Test calculation with quantity of 1"""
        stock, purchase_date = self._create_stock_with_history('TEST3', 100, 110)
        quantity = 1
        # old_price (100) - new_price (110) = -10
        result = calculate_stock_price_difference(stock, purchase_date, quantity)
        assert result == -10

    def test_calculate_difference_with_large_quantity(self):
        """Test calculation with large quantity"""
        stock, purchase_date = self._create_stock_with_history('TEST4', 100, 110)
        quantity = 1000
        # old_price (100) - new_price (110) = -10, -10 * 1000 = -10000
        result = calculate_stock_price_difference(stock, purchase_date, quantity)
        assert result == -10000

    def test_missing_old_price_returns_none(self):
        """Test when purchase amount is None"""
        stock = StockModel.objects.create(
            symbol='TEST5',
            company_name='Test5 Company',
            price=11000  # 110 in dollars, stored in cents
        )

        # Create latest price record
        StockHistory.objects.create(
            stock_symbol=stock,
            day_and_time=datetime(2024, 1, 15, 12, 0, 0),
            open_price=109,
            close_price=110,
            high=115,
            low=105,
            volume=1000000
        )

        # Pass None as purchase amount
        result = calculate_stock_price_difference(stock, None, 10)
        assert result is None

    def test_missing_new_price_returns_none(self):
        """Test when no stock history exists for the symbol"""
        stock = StockModel.objects.create(
            symbol='TEST6',
            company_name='Test6 Company'
        )
        # Don't create any history records
        result = calculate_stock_price_difference(stock, 100, 10)
        assert result is None

    def test_with_zero_quantity(self):
        """Test calculation with zero quantity"""
        stock, purchase_date = self._create_stock_with_history('TEST7', 100, 110)
        quantity = 0
        result = calculate_stock_price_difference(stock, purchase_date, quantity)
        assert result == 0

    def test_with_same_prices(self):
        """Test calculation when prices are the same"""
        stock, purchase_date = self._create_stock_with_history('TEST8', 100, 100)
        quantity = 10
        result = calculate_stock_price_difference(stock, purchase_date, quantity)
        assert result == 0
