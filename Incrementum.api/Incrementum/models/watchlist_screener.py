from django.db import models


class WatchlistScreener(models.Model):
    watchlist = models.ForeignKey(
        'Watchlist',
        on_delete=models.CASCADE,
        db_column='watchlist_id'
    )
    screener = models.ForeignKey(
        'Screener',
        on_delete=models.CASCADE,
        db_column='screener_id'
    )

    class Meta:
        db_table = 'watchlist_screener'
        unique_together = (('watchlist', 'screener'),)

    @classmethod
    def fetch_all(cls):
        """
        Fetch all watchlist screener associations from the database.

        Returns:
            QuerySet: All WatchlistScreener objects from the database.
        """
        return cls.objects.all()
