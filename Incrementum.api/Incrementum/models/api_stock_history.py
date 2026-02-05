from django.db import models
from django.utils import timezone
from ..managers.stock_history_api_manager import StockHistoryAPIManager, StockHistoryDoesNotExist
from typing import Dict


class APIStockHistory(models.Model):
    """
    API-backed Stock History model that mimics Django ORM StockHistory behavior.
    Uses StockHistoryAPIManager for data access instead of database queries.
    """
    stock_symbol = models.CharField(max_length=20)
    day_and_time = models.DateTimeField()
    open_price = models.IntegerField()
    close_price = models.IntegerField()
    high = models.IntegerField()
    low = models.IntegerField()
    volume = models.IntegerField()
    is_hourly = models.BooleanField(default=True)

    objects = StockHistoryAPIManager()

    class Meta:
        db_table = 'stock_history'
        managed = False
        unique_together = (('stock_symbol', 'day_and_time'),)

    DoesNotExist = StockHistoryDoesNotExist

    def __init__(self, **data):
        # Handle API response data mapping
        if data:
            # Handle stock_symbol (could be string or object)
            stock_symbol = data.get('stock_symbol') or data.get('symbol')
            if not isinstance(stock_symbol, str):
                stock_symbol = str(stock_symbol) if stock_symbol else ''

            # Parse timestamp/date fields
            day_and_time = self._parse_datetime(
                data.get('day_and_time') or
                data.get('timestamp') or
                data.get('datetime')
            )

            # Price fields (API might return floats, convert to integers as
            # expected)
            open_price = self._to_int_price(
                data.get('open_price') or data.get('open'))
            close_price = self._to_int_price(
                data.get('close_price') or data.get('close'))
            high = self._to_int_price(data.get('high'))
            low = self._to_int_price(data.get('low'))
            volume = data.get('volume', 0)
            is_hourly = data.get('is_hourly', True)

            mapped_data = {
                'stock_symbol': stock_symbol,
                'day_and_time': day_and_time,
                'open_price': open_price,
                'close_price': close_price,
                'high': high,
                'low': low,
                'volume': volume,
                'is_hourly': is_hourly,
            }
            super().__init__(**mapped_data)
        else:
            super().__init__(**data)

    def _parse_datetime(self, value):
        """Parse datetime string to datetime object."""
        if not value:
            return timezone.now()
        if isinstance(value, str):
            try:
                return timezone.datetime.fromisoformat(
                    value.replace('Z', '+00:00'))
            except BaseException:
                try:
                    return timezone.datetime.strptime(
                        value, '%Y-%m-%d %H:%M:%S')
                except BaseException:
                    return timezone.now()
        return value

    def _to_int_price(self, value):
        """Convert price to integer (assuming cents representation)."""
        if value is None:
            return 0
        if isinstance(value, float):
            return int(value * 100)  # Convert dollars to cents
        return int(value)

    def __str__(self):
        return f"{self.stock_symbol} - {self.day_and_time}"

    @classmethod
    def fetch_all(cls):
        """
        Compatibility method for existing code.
        """
        return cls.objects.all()

    def save(self):
        """
        Save operation - not supported for read-only API.
        """
        raise NotImplementedError(
            "Save operations not supported for API-backed models")

    def delete(self):
        """
        Delete operation - not supported for read-only API.
        """
        raise NotImplementedError(
            "Delete operations not supported for API-backed models")


class MockStock:
    """
    Mock stock object for stock_symbol relationships.
    """

    def __init__(self, symbol: str):
        self.symbol = symbol

    def __str__(self):
        return self.symbol
