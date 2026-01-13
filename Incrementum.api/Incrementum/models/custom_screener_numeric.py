from django.db import models


class CustomScreenerNumeric(models.Model):
    custom_screener = models.ForeignKey(
        'custom_screener.CustomScreener',
        on_delete=models.CASCADE,
        db_column='custom_screener_id'
    )
    numeric_filter = models.ForeignKey(
        'numeric_filter.NumericFilter',
        on_delete=models.CASCADE,
        db_column='numeric_filter_id'
    )
    numeric_value = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'custom_screener_numeric'
        unique_together = (('custom_screener', 'numeric_filter'),)

    @classmethod
    def fetch_all(cls):
        """
        Fetch all custom screener numeric filters from the database.
        
        Returns:
            QuerySet: All CustomScreenerNumeric objects from the database.
        """
        return cls.objects.all()
