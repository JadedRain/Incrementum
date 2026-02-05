from typing import List, Dict
from django.db import models
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from ..services.stock_api_client import stock_api_client
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class StockDoesNotExist(ObjectDoesNotExist):
    """Exception raised when stock is not found via API."""
    pass


class APIQuerySet(models.QuerySet):
    """
    Custom QuerySet for API results. Overrides Django QuerySet to use API instead of DB.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._api_data = None
        self._filters_dict = {}

    def _fetch_api_data(self):
        """Fetch data from API."""
        if self._api_data is None:
            try:
                response = stock_api_client.get_stocks(limit=10000, offset=0)
                if response and 'stocks' in response:
                    self._api_data = response['stocks']
                else:
                    self._api_data = []
            except Exception as e:
                logger.error(f"Error fetching stocks from API: {str(e)}")
                self._api_data = []
        return self._api_data

    def filter(self, **kwargs):
        """Filter the API results."""
        clone = self._clone()
        clone._filters_dict.update(kwargs)
        return clone

    def get(self, **kwargs):
        """Get a single result from API."""
        if 'symbol' in kwargs or 'symbol__iexact' in kwargs:
            symbol = kwargs.get('symbol') or kwargs.get('symbol__iexact')
            response = stock_api_client.get_stock_by_symbol(symbol)
            if response:
                return self.model(**response)
            else:
                raise StockDoesNotExist("Stock matching query does not exist.")

        # Filter results
        results = list(self.filter(**kwargs))
        if len(results) == 0:
            raise StockDoesNotExist("Stock matching query does not exist.")
        elif len(results) > 1:
            raise MultipleObjectsReturned(
                "Multiple stocks returned for query.")
        return results[0]

    def _apply_filters(self, data: List[Dict]) -> List[Dict]:
        """Apply stored filters to data."""
        for field, value in self._filters_dict.items():
            if '__' in field:
                field_name, lookup = field.split('__', 1)
                if lookup == 'iexact':
                    data = [
                        item for item in data
                        if item.get(field_name, '').lower() == value.lower()
                    ]
                elif lookup == 'in':
                    data = [
                        item for item in data if item.get(field_name) in value]
                elif lookup == 'icontains':
                    data = [
                        item for item in data
                        if value.lower()
                        in item.get(field_name, '').lower()
                    ]
                elif lookup == 'isnull':
                    if value:
                        data = [
                            item for item in data if item.get(field_name) is None]
                    else:
                        data = [
                            item for item in data if item.get(field_name) is not None]
            else:
                data = [item for item in data if item.get(field) == value]
        return data

    def __iter__(self):
        """Iterate over API results."""
        api_data = self._fetch_api_data()
        filtered = self._apply_filters(api_data)
        for item in filtered:
            yield self.model(**item)

    def count(self):
        """Count results."""
        api_data = self._fetch_api_data()
        filtered = self._apply_filters(api_data)
        return len(filtered)

    def exists(self):
        """Check if results exist."""
        return self.count() > 0


class StockAPIManager(models.Manager):
    """
    Custom Manager for API-backed Stock model.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._cache = {}
        self._cache_timestamp = None
        self._cache_ttl = 300  # 5 minutes

    def get_queryset(self):
        """Return custom APIQuerySet instead of Django QuerySet."""
        qs = APIQuerySet(self.model, using=self._db)
        return qs

    def _is_cache_valid(self) -> bool:
        """Check if cache is still valid."""
        if not self._cache_timestamp:
            return False
        return (
            datetime.now() -
            self._cache_timestamp).seconds < self._cache_ttl

    def _get_all_stocks(self) -> List[Dict]:
        """Get all stocks from API with caching."""
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
        """Return all stocks."""
        return self.get_queryset()

    def filter(self, **kwargs):
        """Return filtered queryset."""
        return self.get_queryset().filter(**kwargs)

    def get(self, **kwargs):
        """Get a single stock."""
        return self.get_queryset().get(**kwargs)

    def exists(self) -> bool:
        """Check if any stocks exist."""
        stocks_data = self._get_all_stocks()
        return len(stocks_data) > 0

    def count(self) -> int:
        """Return total count of stocks."""
        stocks_data = self._get_all_stocks()
        return len(stocks_data)

    def create(self, **kwargs):
        """Create is not supported."""
        raise NotImplementedError(
            "Create operations not supported for API-backed models")

    def bulk_create(self, objs, **kwargs):
        """Bulk create is not supported."""
        raise NotImplementedError(
            "Bulk create operations not supported for API-backed models")
