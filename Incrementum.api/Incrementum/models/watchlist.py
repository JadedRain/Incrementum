from django.db import models


class Watchlist(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.OneToOneField(
        'account.Account',
        on_delete=models.CASCADE,
        db_column='account_id',
        unique=True,
    )
    name = models.CharField(max_length=50)
    stocks = models.ManyToManyField(
        'stock.StockModel',
        through='watchlist_stock.WatchlistStock',
        related_name='watchlists',
    )

    class Meta:
        db_table = 'watchlist'

    def __str__(self):
        return f"Watchlist for {self.account.name}"

    @classmethod
    def fetch_all(cls):
        """
        Fetch all watchlists from the database.

        Returns:
            QuerySet: All Watchlist objects from the database.
        """
        return cls.objects.all()
