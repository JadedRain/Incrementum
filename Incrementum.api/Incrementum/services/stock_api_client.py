import requests
import logging
from typing import Optional, Dict
from django.conf import settings


logger = logging.getLogger(__name__)


class StockAPIClient:

    def __init__(self):
        self.base_url = getattr(
            settings,
            'STOCK_API_BASE_URL',
            'http://localhost:8001')
        self.timeout = getattr(settings, 'STOCK_API_TIMEOUT', 30)
        self.session = requests.Session()

    def _make_request(
            self,
            method: str,
            endpoint: str,
            params: Dict = None,
            json_data: Dict = None) -> Optional[Dict]:
        url = f"{self.base_url}{endpoint}"

        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                json=json_data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {method} {url} - {str(e)}")
            return None

    def get_stocks(self, limit: int = 1000, offset: int = 0) -> Optional[Dict]:
        params = {'limit': limit, 'offset': offset}
        return self._make_request('GET', '/stocks', params=params)

    def get_stock_by_symbol(self, symbol: str) -> Optional[Dict]:
        return self._make_request('GET', f'/stock/{symbol}')

    def get_stock_history(
            self,
            symbol: str,
            start_date: str = None,
            end_date: str = None,
            ishourly: bool = None,
            limit: int = 1000,
            offset: int = 0) -> Optional[Dict]:
        params = {'limit': limit, 'offset': offset}
        if start_date:
            params['start_date'] = start_date
        if end_date:
            params['end_date'] = end_date
        if ishourly is not None:
            params['ishourly'] = str(ishourly).lower()

        return self._make_request(
            'GET', f'/stock/{symbol}/history', params=params)

    def get_stock_date_range(self, symbol: str) -> Optional[Dict]:
        return self._make_request('GET', f'/stock/{symbol}/date-range')

    def get_rate_limit_status(self) -> Optional[Dict]:
        return self._make_request('GET', '/rate-limit-status')

    def get_blacklist(self, ticker: str = None) -> Optional[Dict]:
        params = {'ticker': ticker} if ticker else None
        return self._make_request('GET', '/blacklist', params=params)


stock_api_client = StockAPIClient()
