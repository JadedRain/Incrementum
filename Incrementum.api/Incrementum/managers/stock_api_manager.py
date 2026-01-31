from typing import List, Optional, Any, Dict
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from ..services.stock_api_client import stock_api_client
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class StockDoesNotExist(ObjectDoesNotExist):
    """Exception raised when stock is not found via API."""
    pass


class APIQuerySet:
    """
    Mimics Django QuerySet behavior for API results.
    """
    
    def __init__(self, model_class, data: List[Dict] = None):
        self.model_class = model_class
        self._data = data or []
        self._filters = {}
        self._limit = None
        self._offset = 0
        self._order_by = None
    
    def filter(self, **kwargs):
        """
        Filter the queryset. Returns new APIQuerySet with filters applied.
        """
        new_qs = APIQuerySet(self.model_class, self._data)
        new_qs._filters = {**self._filters, **kwargs}
        new_qs._limit = self._limit
        new_qs._offset = self._offset
        new_qs._order_by = self._order_by
        return new_qs
    
    def order_by(self, *fields):
        """
        Order the queryset by specified fields.
        """
        new_qs = APIQuerySet(self.model_class, self._data)
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
        Apply filters and return filtered data.
        """
        if not self._data:
            return []
        
        data = self._data.copy()
        
        # Apply filters
        for field, value in self._filters.items():
            if '__' in field:
                field_name, lookup = field.split('__', 1)
                if lookup == 'iexact':
                    data = [item for item in data if item.get(field_name, '').lower() == value.lower()]
                elif lookup == 'in':
                    data = [item for item in data if item.get(field_name) in value]
                elif lookup == 'icontains':
                    data = [item for item in data if value.lower() in item.get(field_name, '').lower()]
                elif lookup == 'isnull':
                    if value:
                        data = [item for item in data if item.get(field_name) is None]
                    else:
                        data = [item for item in data if item.get(field_name) is not None]
            else:
                data = [item for item in data if item.get(field) == value]
        
        # Apply ordering
        if self._order_by:
            for field in reversed(self._order_by):
                reverse = field.startswith('-')
                field_name = field[1:] if reverse else field
                data.sort(key=lambda x: x.get(field_name, ''), reverse=reverse)
        
        return data


class StockAPIManager:
    """
    Mimics Django Model Manager behavior for Stock API calls.
    Implements get(), filter(), all(), exists(), count() methods.
    """
    
    def __init__(self, model_class):
        self.model_class = model_class
        self._cache = {}
        self._cache_timestamp = None
        self._cache_ttl = 300  # 5 minutes
    
    def _is_cache_valid(self) -> bool:
        """Check if cache is still valid."""
        if not self._cache_timestamp:
            return False
        return (datetime.now() - self._cache_timestamp).seconds < self._cache_ttl
    
    def _get_all_stocks(self) -> List[Dict]:
        """
        Get all stocks from API with caching.
        """
        if self._is_cache_valid() and 'all_stocks' in self._cache:
            return self._cache['all_stocks']
        
        try:
            response = stock_api_client.get_stocks(limit=10000, offset=0)
            if response and 'stocks' in response:
                stocks_data = response['stocks']
                self._cache['all_stocks'] = stocks_data
                self._cache_timestamp = datetime.now()
                return stocks_data
            else:
                logger.error("Failed to fetch stocks from API")
                return []
        except Exception as e:
            logger.error(f"Error fetching stocks from API: {str(e)}")
            return []
    
    def all(self):
        """
        Return QuerySet of all stocks.
        """
        stocks_data = self._get_all_stocks()
        return APIQuerySet(self.model_class, stocks_data)
    
    def filter(self, **kwargs):
        """
        Return filtered QuerySet.
        """
        stocks_data = self._get_all_stocks()
        return APIQuerySet(self.model_class, stocks_data).filter(**kwargs)
    
    def get(self, **kwargs):
        """
        Get a single stock matching the criteria.
        Raises StockDoesNotExist if not found, MultipleObjectsReturned if multiple.
        """
        if 'symbol' in kwargs or 'symbol__iexact' in kwargs:
            # Direct API call for symbol lookup
            symbol = kwargs.get('symbol') or kwargs.get('symbol__iexact')
            response = stock_api_client.get_stock_by_symbol(symbol)
            if response:
                return self.model_class(**response)
            else:
                raise StockDoesNotExist(f"Stock matching query does not exist.")
        
        # Fallback to filtering all stocks
        queryset = self.filter(**kwargs)
        data = queryset._get_data()
        
        if len(data) == 0:
            raise StockDoesNotExist(f"Stock matching query does not exist.")
        elif len(data) > 1:
            raise MultipleObjectsReturned(f"Multiple stocks returned for query.")
        
        return self.model_class(**data[0])
    
    def exists(self) -> bool:
        """
        Check if any stocks exist.
        """
        return len(self._get_all_stocks()) > 0
    
    def count(self) -> int:
        """
        Return total count of stocks.
        """
        return len(self._get_all_stocks())
    
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