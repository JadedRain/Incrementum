from django.db import models


class WatchlistStock(models.Model):
    watchlist = models.ForeignKey(
        'Watchlist',
        on_delete=models.CASCADE,
        db_column='watchlist_id'
    )
    stock = models.ForeignKey(
        'StockModel',
        on_delete=models.CASCADE,
        db_column='stock_symbol'
    )

    class Meta:
        db_table = 'watchlist_stock'
        unique_together = (('watchlist', 'stock'),)
        managed = True

    @classmethod
    def fetch_all(cls):
        """
        Fetch all watchlist stock associations from the database.

        Returns:
            QuerySet: All WatchlistStock objects from the database.
        """
        return cls.objects.all()
