from django.db import models


class UserStockPotential(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.ForeignKey(
        'Account',
        on_delete=models.CASCADE,
        db_column='account_id'
    )
    stock_symbol = models.ForeignKey(
        'StockModel',
        on_delete=models.CASCADE,
        db_column='stock_symbol',
        to_field='symbol'
    )
    purchase_date = models.DateField()
    quantity = models.DecimalField(max_digits=15, decimal_places=4)
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        db_table = 'user_stock_potential'
        managed = False

    @classmethod
    def fetch_all(cls):
        return cls.objects.all()
