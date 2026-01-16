from django.db import models


class StockModel(models.Model):
    symbol = models.CharField(max_length=10, primary_key=True)
    company_name = models.CharField(max_length=100)
    stock_history_updated_at = models.DateTimeField(auto_now=True)
    yfinance_data_updated_at = models.DateTimeField(null=True, blank=True)
    current_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    open_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    previous_close = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    day_high = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    day_low = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    fifty_day_average = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    fifty_two_week_high = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    fifty_two_week_low = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    exchange = models.CharField(max_length=20, null=True, blank=True)
    full_exchange_name = models.CharField(max_length=100, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    sector = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    market_cap = models.BigIntegerField(null=True, blank=True)
    volume = models.BigIntegerField(null=True, blank=True)
    average_volume = models.BigIntegerField(null=True, blank=True)
    regular_market_change_percent = models.DecimalField(
        max_digits=10, decimal_places=4, null=True, blank=True
    )

    class Meta:
        db_table = 'stock'

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'company_name': self.company_name,
            'stock_history_updated_at': (
                self.stock_history_updated_at.isoformat()
                if self.stock_history_updated_at else None
            ),
            'yfinance_data_updated_at': (
                self.yfinance_data_updated_at.isoformat()
                if self.yfinance_data_updated_at else None
            ),
            'current_price': (
                float(self.current_price) if self.current_price else None
            ),
            'open_price': (
                float(self.open_price) if self.open_price else None
            ),
            'previous_close': (
                float(self.previous_close) if self.previous_close else None
            ),
            'day_high': float(self.day_high) if self.day_high else None,
            'day_low': float(self.day_low) if self.day_low else None,
            'fifty_day_average': (
                float(self.fifty_day_average)
                if self.fifty_day_average else None
            ),
            'fifty_two_week_high': (
                float(self.fifty_two_week_high)
                if self.fifty_two_week_high else None
            ),
            'fifty_two_week_low': (
                float(self.fifty_two_week_low)
                if self.fifty_two_week_low else None
            ),
            'exchange': self.exchange,
            'full_exchange_name': self.full_exchange_name,
            'industry': self.industry,
            'sector': self.sector,
            'country': self.country,
            'market_cap': self.market_cap,
            'volume': self.volume,
            'average_volume': self.average_volume,
            'regular_market_change_percent': (
                float(self.regular_market_change_percent)
                if self.regular_market_change_percent else None
            ),
        }

    @classmethod
    def fetch_all(cls):
        """
        Fetch all stocks from the database.

        Returns:
            QuerySet: All StockModel objects from the database.
        """
        return cls.objects.all()


# Alias for backward compatibility
Stock = StockModel
