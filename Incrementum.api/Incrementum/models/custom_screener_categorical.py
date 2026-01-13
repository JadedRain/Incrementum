from django.db import models


class CustomScreenerCategorical(models.Model):
    custom_screener = models.ForeignKey(
        'custom_screener.CustomScreener',
        on_delete=models.CASCADE,
        db_column='custom_screener_id'
    )
    categorical_filter = models.ForeignKey(
        'categorical_filter.CategoricalFilter',
        on_delete=models.CASCADE,
        db_column='categorical_filter_id'
    )
    category_value = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'custom_screener_categorical'
        unique_together = (('custom_screener', 'categorical_filter'),)

    @classmethod
    def fetch_all(cls):
        """
        Fetch all custom screener categorical filters from the database.
        
        Returns:
            QuerySet: All CustomScreenerCategorical objects from the database.
        """
        return cls.objects.all()
