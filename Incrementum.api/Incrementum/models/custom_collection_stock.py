from django.db import models


class CustomCollectionStock(models.Model):
    collection = models.ForeignKey(
        'CustomCollection',
        on_delete=models.CASCADE,
        db_column='collection_id'
    )
    stock = models.ForeignKey(
        'StockModel',
        on_delete=models.CASCADE,
        db_column='stock_symbol'
    )

    class Meta:
        db_table = 'custom_collection_stock'
        unique_together = (('collection', 'stock'),)
        managed = False

    @classmethod
    def fetch_all(cls):
        return cls.objects.all()
