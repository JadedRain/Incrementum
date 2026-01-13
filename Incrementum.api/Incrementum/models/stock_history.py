from django.db import models


class StockHistory(models.Model):
    stock_symbol = models.ForeignKey(
        'stock.StockModel',
        on_delete=models.CASCADE,
        db_column='stock_symbol',
        to_field='symbol'
    )
    day_and_time = models.DateTimeField()
    open_price = models.IntegerField()
    close_price = models.IntegerField()
    high = models.IntegerField()
    low = models.IntegerField()
    volume = models.IntegerField()
    is_hourly = models.BooleanField(default=True)

    class Meta:
        db_table = 'stock_history'
        managed = False
        unique_together = (('stock_symbol', 'day_and_time'),)

    def __str__(self):
        return f"{self.stock_symbol} - {self.day_and_time}"

    @classmethod
    def fetch_all(cls):
        """
        Fetch all stock history records from the database.
        
        Returns:
            QuerySet: All StockHistory objects from the database.
        """
        return cls.objects.all()
