from django.utils import timezone
from ..managers.stock_history_api_manager import StockHistoryAPIManager, StockHistoryDoesNotExist
from typing import Optional, Dict, Any
from datetime import datetime


class APIStockHistory:
    """
    API-backed Stock History model that mimics Django ORM StockHistory behavior.
    Uses StockHistoryAPIManager for data access instead of database queries.
    """
    
    DoesNotExist = StockHistoryDoesNotExist
    objects = StockHistoryAPIManager(lambda **kwargs: APIStockHistory(**kwargs))
    
    def __init__(self, **data):
        # Map API response fields to model attributes
        self.id = data.get('id')
        
        # Handle stock_symbol (could be string or object)
        stock_symbol = data.get('stock_symbol') or data.get('symbol')
        if isinstance(stock_symbol, str):
            self.stock_symbol = MockStock(stock_symbol)
        else:
            self.stock_symbol = stock_symbol
        
        # Parse timestamp/date fields
        self.day_and_time = self._parse_datetime(
            data.get('day_and_time') or 
            data.get('timestamp') or 
            data.get('datetime')
        )
        
        # Price fields (API might return floats, convert to integers as expected)
        self.open_price = self._to_int_price(data.get('open_price') or data.get('open'))
        self.close_price = self._to_int_price(data.get('close_price') or data.get('close'))
        self.high = self._to_int_price(data.get('high'))
        self.low = self._to_int_price(data.get('low'))
        self.volume = data.get('volume', 0)
        
        # Determine if hourly based on data or default to True
        self.is_hourly = data.get('is_hourly', True)
    
    def _parse_datetime(self, value):
        """Parse datetime string to datetime object."""
        if not value:
            return timezone.now()
        if isinstance(value, str):
            try:
                return timezone.datetime.fromisoformat(value.replace('Z', '+00:00'))
            except:
                try:
                    return timezone.datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
                except:
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
        raise NotImplementedError("Save operations not supported for API-backed models")
    
    def delete(self):
        """
        Delete operation - not supported for read-only API.
        """
        raise NotImplementedError("Delete operations not supported for API-backed models")


class MockStock:
    """
    Mock stock object for stock_symbol relationships.
    """
    def __init__(self, symbol: str):
        self.symbol = symbol
    
    def __str__(self):
        return self.symbol