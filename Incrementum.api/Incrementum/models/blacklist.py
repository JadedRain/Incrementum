from django.db import models


class Blacklist(models.Model):
    id = models.AutoField(primary_key=True)
    stock_symbol = models.ForeignKey(
        'StockModel',
        on_delete=models.CASCADE,
        db_column='stock_symbol',
        to_field='symbol'
    )
    timestamp = models.DateTimeField()
    time_added = models.DateTimeField()

    class Meta:
        db_table = 'blacklist'
        managed = False
        unique_together = (('stock_symbol', 'timestamp'),)

    def __str__(self):
        return f"Blacklist: {self.stock_symbol} at {self.timestamp}"

    @classmethod
    def fetch_all(cls):
        """
        Fetch all blacklist entries from the database.

        Returns:
            QuerySet: All Blacklist objects from the database.
        """
        return cls.objects.all()
