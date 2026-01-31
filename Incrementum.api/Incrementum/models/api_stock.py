from django.utils import timezone
from ..managers.stock_api_manager import StockAPIManager, StockDoesNotExist
from typing import Optional, Dict, Any


class APIStockModel:    
    DoesNotExist = StockDoesNotExist
    objects = StockAPIManager(lambda **kwargs: APIStockModel(**kwargs))
    
    def __init__(self, **data):
        # Map API response fields to model attributes
        self.symbol = data.get('symbol', '')
        self.company_name = data.get('company_name', '') or data.get('longName', '') or data.get('shortName', '')
        self.updated_at = self._parse_datetime(data.get('updated_at')) or timezone.now()
        self.description = data.get('description')
        self.market_cap = data.get('market_cap') or data.get('marketCap')
        self.primary_exchange = data.get('primary_exchange') or data.get('exchange')
        self.type = data.get('type')
        self.currency_name = data.get('currency_name') or data.get('currency')
        self.cik = data.get('cik')
        self.composite_figi = data.get('composite_figi')
        self.share_class_figi = data.get('share_class_figi')
        self.outstanding_shares = data.get('outstanding_shares')
        self.eps = data.get('eps')
        self.homepage_url = data.get('homepage_url') or data.get('website')
        self.total_employees = data.get('total_employees')
        self.list_date = self._parse_date(data.get('list_date'))
        self.locale = data.get('locale')
        self.sic_code = data.get('sic_code')
        self.sic_description = data.get('sic_description')
        
        # Additional fields that might come from yfinance data
        self.current_price = data.get('regularMarketPrice') or data.get('currentPrice')
        self.day_high = data.get('dayHigh')
        self.day_low = data.get('dayLow')
        self.fifty_day_average = data.get('fiftyDayAverage')
        self.sector = data.get('sector')
        self.industry = data.get('industry')
    
    def _parse_datetime(self, value):
        if not value:
            return None
        if isinstance(value, str):
            try:
                return timezone.datetime.fromisoformat(value.replace('Z', '+00:00'))
            except:
                return None
        return value
    
    def _parse_date(self, value):
        if not value:
            return None
        if isinstance(value, str):
            try:
                return timezone.datetime.fromisoformat(value).date()
            except:
                return None
        return value
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'symbol': self.symbol,
            'company_name': self.company_name,
            'updated_at': (
                self.updated_at.isoformat() if self.updated_at else None
            ),
            'description': self.description,
            'market_cap': self.market_cap,
            'primary_exchange': self.primary_exchange,
            'type': self.type,
            'currency_name': self.currency_name,
            'cik': self.cik,
            'composite_figi': self.composite_figi,
            'share_class_figi': self.share_class_figi,
            'outstanding_shares': self.outstanding_shares,
            'eps': (float(self.eps) if self.eps is not None else None),
            'homepage_url': self.homepage_url,
            'total_employees': self.total_employees,
            'list_date': (
                self.list_date.isoformat() if self.list_date else None
            ),
            'locale': self.locale,
            'sic_code': self.sic_code,
            'sic_description': self.sic_description,
        }
    
    def __str__(self):
        return f"{self.symbol} - {self.company_name}"
    
    @classmethod
    def fetch_all(cls):
        return cls.objects.all()
    
    def save(self):
        raise NotImplementedError("Save operations not supported for API-backed models")
    
    def delete(self):
        raise NotImplementedError("Delete operations not supported for API-backed models")


# Alias for backward compatibility
APIStock = APIStockModel