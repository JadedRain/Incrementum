from django.db import models
from django.utils import timezone
from ..managers.stock_api_manager import StockAPIManager, StockDoesNotExist
from typing import Dict


class APIStockModel(models.Model):
    symbol = models.CharField(max_length=10, primary_key=True)
    company_name = models.CharField(max_length=255)
    updated_at = models.DateTimeField(default=timezone.now)
    description = models.TextField(null=True, blank=True)
    market_cap = models.BigIntegerField(null=True, blank=True)
    primary_exchange = models.CharField(max_length=50, null=True, blank=True)
    type = models.CharField(max_length=50, null=True, blank=True)
    currency_name = models.CharField(max_length=50, null=True, blank=True)
    cik = models.CharField(max_length=20, null=True, blank=True)
    composite_figi = models.CharField(max_length=50, null=True, blank=True)
    share_class_figi = models.CharField(max_length=50, null=True, blank=True)
    outstanding_shares = models.BigIntegerField(null=True, blank=True)
    eps = models.DecimalField(
        max_digits=20, decimal_places=4, null=True, blank=True
    )
    homepage_url = models.CharField(max_length=500, null=True, blank=True)
    total_employees = models.IntegerField(null=True, blank=True)
    list_date = models.DateField(null=True, blank=True)
    locale = models.CharField(max_length=10, null=True, blank=True)
    sic_code = models.CharField(max_length=20, null=True, blank=True)
    sic_description = models.CharField(max_length=255, null=True, blank=True)

    objects = StockAPIManager()

    class Meta:
        db_table = 'stock'
        managed = False

    DoesNotExist = StockDoesNotExist

    def __init__(self, **kwargs):
        # Handle API response data mapping
        if kwargs:
            # Map API fields to model fields
            mapped_data = {
                'symbol': kwargs.get(
                    'symbol',
                    ''),
                'company_name': kwargs.get(
                    'company_name',
                    '') or kwargs.get(
                    'longName',
                    '') or kwargs.get(
                    'shortName',
                    ''),
                'updated_at': self._parse_datetime(
                    kwargs.get('updated_at')) or timezone.now(),
                'description': kwargs.get('description'),
                'market_cap': kwargs.get('market_cap') or kwargs.get('marketCap'),
                'primary_exchange': kwargs.get('primary_exchange') or kwargs.get('exchange'),
                'type': kwargs.get('type'),
                'currency_name': kwargs.get('currency_name') or kwargs.get('currency'),
                'cik': kwargs.get('cik'),
                'composite_figi': kwargs.get('composite_figi'),
                'share_class_figi': kwargs.get('share_class_figi'),
                'outstanding_shares': kwargs.get('outstanding_shares'),
                'eps': kwargs.get('eps'),
                'homepage_url': kwargs.get('homepage_url') or kwargs.get('website'),
                'total_employees': kwargs.get('total_employees'),
                'list_date': self._parse_date(
                    kwargs.get('list_date')),
                'locale': kwargs.get('locale'),
                'sic_code': kwargs.get('sic_code'),
                'sic_description': kwargs.get('sic_description'),
            }
            super().__init__(**mapped_data)

            # Store additional API fields on the instance (not as model fields)
            self.currentPrice = kwargs.get('latest_price') or kwargs.get(
                'regularMarketPrice') or kwargs.get('currentPrice')
            self.dayHigh = kwargs.get('dayHigh')
            self.dayLow = kwargs.get('dayLow')
            self.fiftyDayAverage = kwargs.get('fiftyDayAverage')
            self.sector = kwargs.get('sector')
            self.industry = kwargs.get('industry')
        else:
            super().__init__(**kwargs)

    def _parse_datetime(self, value):
        if not value:
            return None
        if isinstance(value, str):
            try:
                return timezone.datetime.fromisoformat(
                    value.replace('Z', '+00:00'))
            except BaseException:
                return None
        return value

    def _parse_date(self, value):
        if not value:
            return None
        if isinstance(value, str):
            try:
                return timezone.datetime.fromisoformat(value).date()
            except BaseException:
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
            'currentPrice': getattr(self, 'currentPrice', None),
            'dayHigh': getattr(self, 'dayHigh', None),
            'dayLow': getattr(self, 'dayLow', None),
            'fiftyDayAverage': getattr(self, 'fiftyDayAverage', None),
            'sector': getattr(self, 'sector', None),
            'industry': getattr(self, 'industry', None),
        }

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"

    @classmethod
    def fetch_all(cls):
        return cls.objects.all()

    def save(self):
        raise NotImplementedError(
            "Save operations not supported for API-backed models")

    def delete(self):
        raise NotImplementedError(
            "Delete operations not supported for API-backed models")


# Alias for backward compatibility
APIStock = APIStockModel
