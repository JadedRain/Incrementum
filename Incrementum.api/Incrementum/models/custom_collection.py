from django.db import models


class CustomCollection(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.ForeignKey(
        'Account',
        on_delete=models.CASCADE,
        db_column='account_id',
        null=True,
        blank=True
    )
    collection_name = models.CharField(max_length=20)
    c_desc = models.CharField(max_length=300, null=True, blank=True)
    date_created = models.DateField(db_column='date_created', auto_now_add=True)
    stocks = models.ManyToManyField(
        'StockModel',
        through='CustomCollectionStock',
        related_name='custom_collections'
    )

    class Meta:
        db_table = 'custom_collection'

    def __str__(self):
        return f"CustomCollection {self.collection_name} (account={self.account})"

    @classmethod
    def fetch_all(cls):
        return cls.objects.all()
