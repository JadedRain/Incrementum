from django.db import models


class CustomCollectionStock(models.Model):
    collection = models.ForeignKey(
        'CustomCollection',
        on_delete=models.CASCADE,
        db_column='collection_id'
    )
    stock_symbol = models.CharField(max_length=10, db_column='stock_symbol')

    class Meta:
        db_table = 'custom_collection_stock'
        unique_together = (('collection', 'stock_symbol'),)
        managed = False

    @classmethod
    def fetch_all(cls):
        return cls.objects.all()
