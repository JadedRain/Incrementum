from typing import List, Dict
from django.db import models
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from ..services.stock_api_client import stock_api_client
import logging

logger = logging.getLogger(__name__)


class StockHistoryDoesNotExist(ObjectDoesNotExist):
    """Exception raised when stock history is not found via API."""
    pass


class StockHistoryAPIQuerySet(models.QuerySet):
    """
    Custom QuerySet for Stock History API results.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._symbol = None
        self._filters_dict = {}
        self._order_by = None

    def _clone(self):
        """Override _clone to preserve custom attributes."""
        clone = super()._clone()
        clone._symbol = self._symbol
        clone._filters_dict = self._filters_dict.copy()
        clone._order_by = self._order_by
        return clone

    def filter(self, **kwargs):
        """Filter the queryset."""
        clone = self._clone()
        logger.info(f"[FILTER] Received kwargs keys: {list(kwargs.keys())}")
        clone._filters_dict.update(kwargs)

        # Handle stock_symbol filtering
        if 'stock_symbol__symbol' in kwargs:
            clone._symbol = kwargs['stock_symbol__symbol']
            logger.info(
                f"[FILTER] Set symbol from stock_symbol__symbol: {clone._symbol}")
        elif 'stock_symbol' in kwargs:
            stock_obj = kwargs['stock_symbol']
            if isinstance(stock_obj, str):
                clone._symbol = stock_obj
            elif hasattr(stock_obj, 'symbol'):
                clone._symbol = stock_obj.symbol
            else:
                clone._symbol = str(stock_obj)
            logger.info(
                f"[FILTER] Set symbol from stock_symbol: {clone._symbol}")

        logger.info(f"[FILTER] Final _symbol: {clone._symbol}")
        return clone

    def order_by(self, *args, **kwargs):
        """Order the queryset - preserve custom QuerySet type."""
        clone = self._clone()
        clone._order_by = args
        logger.info(f"Applied order_by: {args}")
        return clone

    def get(self, **kwargs):
        """Get a single result from API."""
        results = list(self.filter(**kwargs))
        if len(results) == 0:
            raise StockHistoryDoesNotExist(
                "StockHistory matching query does not exist.")
        elif len(results) > 1:
            raise MultipleObjectsReturned(
                "Multiple StockHistory records returned for query.")
        return results[0]

    def _get_api_data(self) -> List[Dict]:
        """Fetch stock history data from API."""
        logger.info("[GET_API_DATA] Starting")
        # If symbol not set, try to extract from filters
        symbol = self._symbol
        logger.info(f"[GET_API_DATA] _symbol={symbol}")
        if not symbol:
            if 'stock_symbol' in self._filters_dict:
                stock_obj = self._filters_dict['stock_symbol']
                if isinstance(stock_obj, str):
                    symbol = stock_obj
                elif hasattr(stock_obj, 'symbol'):
                    symbol = stock_obj.symbol
                else:
                    symbol = str(stock_obj)
                logger.info(
                    f"[GET_API_DATA] Extracted symbol from filters: {symbol}")

        if not symbol:
            logger.warning(
                f"[GET_API_DATA] No symbol set. Filters: {list(self._filters_dict.keys())}")
            return []

        try:
            logger.info(f"[GET_API_DATA] Fetching stock history for {symbol}")
            # Extract date filters
            start_date = None
            end_date = None
            is_hourly = None

            for field, value in self._filters_dict.items():
                if field == 'day_and_time__gte':
                    start_date = value.strftime(
                        '%Y-%m-%d') if hasattr(value, 'strftime') else str(value)
                elif field == 'day_and_time__lte':
                    end_date = value.strftime(
                        '%Y-%m-%d') if hasattr(value, 'strftime') else str(value)
                elif field == 'is_hourly':
                    is_hourly = value

            # Fetch from API
            logger.info("[GET_API_DATA] Calling API...")
            response = stock_api_client.get_stock_history(
                symbol=symbol,
                start_date=start_date,
                end_date=end_date,
                ishourly=is_hourly,
                limit=1000,
                offset=0
            )

            logger.info("[GET_API_DATA] API call returned")
            data = None
            if response:
                logger.info(
                    f"[GET_API_DATA] Response type: {type(response).__name__}")
                if isinstance(response, dict):
                    logger.info(
                        f"[GET_API_DATA] Response keys: {list(response.keys())}")
                    # Check multiple possible key names
                    for key in [
                        'history',
                        'data',
                        'results',
                        'records',
                            'stock_history']:
                        if key in response:
                            logger.info(
                                f"[GET_API_DATA] Found key '{key}' in response")
                            data = response[key]
                            logger.info(
                                f"[GET_API_DATA] Data type for '{key}': {type(data).__name__}")
                            if isinstance(data, list):
                                logger.info(
                                    f"[GET_API_DATA] Retrieved {len(data)} records from '{key}'")
                                transformed_data = []
                                for idx, item in enumerate(data):
                                    try:
                                        transformed = {
                                            'stock_symbol': symbol,
                                            'day_and_time': item.get('timestamp'),
                                            'open_price': item.get('open_price'),
                                            'close_price': item.get('close_price'),
                                            'high': item.get('high'),
                                            'low': item.get('low'),
                                            'volume': item.get('volume'),
                                            'is_hourly': item.get(
                                                'is_hourly',
                                                False)}
                                        if idx < 1:
                                            logger.debug(
                                                f"[GET_API_DATA] Sample keys: "
                                                f"{list(item.keys())}")
                                            logger.debug(
                                                f"[GET_API_DATA] Transformed: "
                                                f"{list(transformed.keys())}")
                                        transformed_data.append(transformed)
                                    except Exception as e:
                                        logger.error(
                                            f"[GET_API_DATA] Transform error "
                                            f"{idx}: {str(e)}")
                                        continue
                                logger.info(
                                    f"[GET_API_DATA] Transformed "
                                    f"{len(transformed_data)} records")
                                data = transformed_data
                                break
                else:
                    logger.warning(
                        f"[GET_API_DATA] Response is not a dict, type: {type(response).__name__}")
                    return []
            else:
                logger.warning(
                    "[GET_API_DATA] Response is None or falsy")
                return []

            if not data:
                logger.warning("[GET_API_DATA] No data found in response")
                return []

            # Apply additional filters
            for field, value in self._filters_dict.items():
                if field not in [
                    'day_and_time__gte',
                    'day_and_time__lte',
                    'is_hourly',
                    'stock_symbol__symbol',
                        'stock_symbol']:
                    if '__' in field:
                        field_name, lookup = field.split('__', 1)
                        if lookup == 'iexact':
                            data = [
                                item for item in data if item.get(
                                    field_name, '').lower() == value.lower()]
                        elif lookup == 'in':
                            data = [
                                item for item in data if item.get(field_name) in value]
                    else:
                        data = [
                            item for item in data if item.get(field) == value]

            logger.info(f"[GET_API_DATA] Returning {len(data)} records")
            return data

        except Exception as e:
            logger.error(f"[GET_API_DATA] Exception: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return []

    def __iter__(self):
        """Iterate over API results - return raw dicts without model instantiation."""
        logger.info("[ITER] Starting iteration")
        try:
            api_data = self._get_api_data()
            logger.info(f"[ITER] Got {len(api_data)} items from API")

            if not api_data:
                logger.warning("[ITER] api_data is empty, nothing to iterate")
                return

            # Apply sorting if order_by was specified
            if self._order_by:
                logger.info(f"[ITER] Applying order_by: {self._order_by}")
                for field in reversed(self._order_by):
                    reverse = False
                    if field.startswith('-'):
                        reverse = True
                        field = field[1:]
                    api_data = sorted(
                        api_data,
                        key=lambda x: x.get(field, ''),
                        reverse=reverse
                    )
                logger.info(f"[ITER] Sorting complete, {len(api_data)} items")

            yielded_count = 0
            logger.info("[ITER] Beginning to yield items")
            for idx, item in enumerate(api_data):
                try:
                    if idx < 1 or idx % 1000 == 0:
                        logger.debug(
                            f"[ITER] Yielding item {idx}")
                    # Return raw dict without model instantiation - much
                    # faster!
                    yield item
                    yielded_count += 1
                except Exception as e:
                    logger.error(
                        f"[ITER] Error yielding item {idx}: {str(e)}",
                        exc_info=True)
                    continue

            logger.info(
                f"[ITER] Finished: yielded {yielded_count} items total")
        except Exception as e:
            logger.error(f"[ITER] Error in __iter__: {str(e)}", exc_info=True)
            raise

    def count(self):
        """Count results."""
        try:
            api_data = self._get_api_data()
            count = len(api_data)
            return count
        except Exception as e:
            logger.error(f"[COUNT] Error: {str(e)}")
            return 0

    def exists(self):
        """Check if results exist."""
        count = self.count()
        exists_result = count > 0
        logger.info(f"[EXISTS] count={count}, exists={exists_result}")
        return exists_result


class StockHistoryAPIManager(models.Manager):
    """
    Custom Manager for API-backed Stock History model.
    """

    def get_queryset(self):
        """Return custom APIQuerySet instead of Django QuerySet."""
        qs = StockHistoryAPIQuerySet(self.model, using=self._db)
        return qs

    def all(self):
        """Return all stock history (not practical for API)."""
        return self.get_queryset()

    def filter(self, **kwargs):
        """Return filtered queryset."""
        return self.get_queryset().filter(**kwargs)

    def get(self, **kwargs):
        """Get a single stock history record."""
        return self.get_queryset().get(**kwargs)

    def exists(self) -> bool:
        """Check if any stock history exists."""
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
        raise NotImplementedError(
            "Create operations not supported for API-backed models")

    def bulk_create(self, objs, **kwargs):
        """
        Bulk create operation - not supported for read-only API.
        """
        raise NotImplementedError(
            "Bulk create operations not supported for API-backed models")
