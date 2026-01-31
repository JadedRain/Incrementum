from django.db import models
from django.utils import timezone


class StockModel(models.Model):
    symbol = models.CharField(max_length=10, primary_key=True)
    company_name = models.CharField(max_length=255)
    updated_at = models.DateTimeField(default=timezone.now)
    description = models.TextField(
        null=True, blank=True, db_column='description'
    )
    market_cap = models.BigIntegerField(
        null=True, blank=True, db_column='market_cap'
    )
    primary_exchange = models.CharField(
        max_length=50, null=True, blank=True,
        db_column='primary_exchange'
    )
    type = models.CharField(
        max_length=50, null=True, blank=True, db_column='type'
    )
    currency_name = models.CharField(
        max_length=50, null=True, blank=True, db_column='currency_name'
    )
    cik = models.CharField(
        max_length=20, null=True, blank=True, db_column='cik'
    )
    composite_figi = models.CharField(
        max_length=50, null=True, blank=True, db_column='composite_figi'
    )
    share_class_figi = models.CharField(
        max_length=50, null=True, blank=True, db_column='share_class_figi'
    )
    outstanding_shares = models.BigIntegerField(
        null=True, blank=True, db_column='outstanding_shares'
    )
    eps = models.DecimalField(
        max_digits=20, decimal_places=4, null=True, blank=True, db_column='eps'
    )
    homepage_url = models.CharField(
        max_length=500, null=True, blank=True, db_column='homepage_url'
    )
    total_employees = models.IntegerField(
        null=True, blank=True, db_column='total_employees'
    )
    list_date = models.DateField(
        null=True, blank=True, db_column='list_date'
    )
    locale = models.CharField(
        max_length=10, null=True, blank=True, db_column='locale'
    )
    sic_code = models.CharField(
        max_length=20, null=True, blank=True, db_column='sic_code'
    )
    sic_description = models.CharField(
        max_length=255, null=True, blank=True, db_column='sic_description'
    )

    class Meta:
        db_table = 'stock'

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"

    def to_dict(self):
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

    @classmethod
    def fetch_all(cls):
        return cls.objects.all()


# Alias for backward compatibility
Stock = StockModel
