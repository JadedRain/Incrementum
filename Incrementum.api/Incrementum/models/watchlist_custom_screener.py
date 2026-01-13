from django.db import models


class WatchlistCustomScreener(models.Model):
    watchlist = models.ForeignKey(
        'watchlist.Watchlist',
        on_delete=models.CASCADE,
        db_column='watchlist_id'
    )
    custom_screener = models.ForeignKey(
        'custom_screener.CustomScreener',
        on_delete=models.CASCADE,
        db_column='custom_screener_id',
    )

    class Meta:
        db_table = 'watchlist_custom_screener'
        unique_together = (('watchlist', 'custom_screener'),)

    @classmethod
    def fetch_all(cls):
        """
        Fetch all watchlist custom screener associations from the database.

        Returns:
            QuerySet: All WatchlistCustomScreener objects from the database.
        """
        return cls.objects.all()
