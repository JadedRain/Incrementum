from typing import List, Optional, Any, Dict
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from ..services.stock_api_client import stock_api_client
import logging
from datetime import datetime
import pandas as pd

logger = logging.getLogger(__name__)


class StockHistoryDoesNotExist(ObjectDoesNotExist):
    """Exception raised when stock history is not found via API."""
    pass


class StockHistoryAPIQuerySet:
    """
    Mimics Django QuerySet behavior for Stock History API results.
    """
    
    def __init__(self, model_class, symbol: str = None, data: List[Dict] = None):
        self.model_class = model_class
        self.symbol = symbol
        self._data = data or []
        self._filters = {}
        self._limit = None
        self._offset = 0
        self._order_by = None
    
    def filter(self, **kwargs):
        """
        Filter the queryset. Returns new StockHistoryAPIQuerySet with filters applied.
        """
        new_qs = StockHistoryAPIQuerySet(self.model_class, self.symbol, self._data)
        new_qs._filters = {**self._filters, **kwargs}
        new_qs._limit = self._limit
        new_qs._offset = self._offset
        new_qs._order_by = self._order_by
        
        # Handle stock_symbol filtering
        if 'stock_symbol__symbol' in kwargs:
            new_qs.symbol = kwargs['stock_symbol__symbol']
        elif 'stock_symbol' in kwargs:
            # Assume it's a stock object with symbol attribute
            stock_obj = kwargs['stock_symbol']
            if hasattr(stock_obj, 'symbol'):
                new_qs.symbol = stock_obj.symbol
            else:
                new_qs.symbol = str(stock_obj)
        
        return new_qs
    
    def order_by(self, *fields):
        """
        Order the queryset by specified fields.
        """
        new_qs = StockHistoryAPIQuerySet(self.model_class, self.symbol, self._data)
        new_qs._filters = self._filters.copy()
        new_qs._limit = self._limit
        new_qs._offset = self._offset
        new_qs._order_by = fields
        return new_qs
    
    def exists(self) -> bool:
        """
        Check if any records exist matching the filters.
        """
        return len(self._get_data()) > 0
    
    def count(self) -> int:
        """
        Return count of records matching the filters.
        """
        return len(self._get_data())
    
    def __iter__(self):
        """
        Make QuerySet iterable.
        """
        for item_data in self._get_data():
            yield self.model_class(**item_data)
    
    def __len__(self):
        return len(self._get_data())
    
    def __getitem__(self, key):
        data = self._get_data()
        if isinstance(key, slice):
            return [self.model_class(**item) for item in data[key]]
        else:
            return self.model_class(**data[key])
    
    def _get_data(self) -> List[Dict]:
        """
        Fetch and filter stock history data from API.
        """
        if not self.symbol:
            return []
        
        try:
            # Extract date filters
            start_date = None
            end_date = None
            is_hourly = None
            
            for field, value in self._filters.items():
                if field == 'day_and_time__gte':
                    start_date = value.strftime('%Y-%m-%d') if hasattr(value, 'strftime') else str(value)
                elif field == 'day_and_time__lte':
                    end_date = value.strftime('%Y-%m-%d') if hasattr(value, 'strftime') else str(value)
                elif field == 'is_hourly':
                    is_hourly = value
            
            # Fetch from API
            response = stock_api_client.get_stock_history(
                symbol=self.symbol,
                start_date=start_date,
                end_date=end_date,
                ishourly=is_hourly,
                limit=self._limit or 1000,
                offset=self._offset
            )
            
            if response and 'history' in response:
                data = response['history']
            else:
                logger.warning(f"No stock history data found for {self.symbol}")
                return []
            
            # Apply additional filters
            for field, value in self._filters.items():
                if field not in ['day_and_time__gte', 'day_and_time__lte', 'is_hourly', 'stock_symbol__symbol', 'stock_symbol']:
                    if '__' in field:
                        field_name, lookup = field.split('__', 1)
                        if lookup == 'iexact':
                            data = [item for item in data if item.get(field_name, '').lower() == value.lower()]
                        elif lookup == 'in':
                            data = [item for item in data if item.get(field_name) in value]
                    else:
                        data = [item for item in data if item.get(field) == value]
            
            # Apply ordering
            if self._order_by:
                for field in reversed(self._order_by):
                    reverse = field.startswith('-')
                    field_name = field[1:] if reverse else field
                    # Map common field names
                    if field_name == 'day_and_time':
                        field_name = 'timestamp'
                    data.sort(key=lambda x: x.get(field_name, ''), reverse=reverse)
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching stock history for {self.symbol}: {str(e)}")
            return []


class StockHistoryAPIManager:
    """
    Mimics Django Model Manager behavior for Stock History API calls.
    """
    
    def __init__(self, model_class):
        self.model_class = model_class
    
    def all(self):
        """
        Return QuerySet of all stock history.
        Note: This is not practical for API calls, returns empty queryset.
        """
        return StockHistoryAPIQuerySet(self.model_class)
    
    def filter(self, **kwargs):
        """
        Return filtered QuerySet.
        """
        return StockHistoryAPIQuerySet(self.model_class).filter(**kwargs)
    
    def get(self, **kwargs):
        """
        Get a single stock history record matching the criteria.
        """
        queryset = self.filter(**kwargs)
        data = queryset._get_data()
        
        if len(data) == 0:
            raise StockHistoryDoesNotExist(f"StockHistory matching query does not exist.")
        elif len(data) > 1:
            raise MultipleObjectsReturned(f"Multiple StockHistory records returned for query.")
        
        return self.model_class(**data[0])
    
    def exists(self) -> bool:
        """
        Check if any stock history exists.
        """
        return True  # Assume some history always exists
    
    def count(self) -> int:
        """
        Return count - not practical for API, returns 0.
        """
        return 0
    
    def create(self, **kwargs):
        """
        Create operation - not supported for read-only API.
        """
        raise NotImplementedError("Create operations not supported for API-backed models")
    
    def bulk_create(self, objs, **kwargs):
        """
        Bulk create operation - not supported for read-only API.
        """
        raise NotImplementedError("Bulk create operations not supported for API-backed models")