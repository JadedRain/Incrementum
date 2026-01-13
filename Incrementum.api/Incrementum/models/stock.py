from django.db import models
from django.utils import timezone


class StockModel(models.Model):
    symbol = models.CharField(max_length=10, primary_key=True)
    company_name = models.CharField(max_length=100)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'stock'

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'company_name': self.company_name,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
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
