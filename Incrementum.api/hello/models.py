from django.db import models
from .models_user import Account

class Stock(models.Model):
    symbol = models.CharField(max_length=5, primary_key=True)
    company_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'stock'

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"

class Watchlist(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.OneToOneField(Account, on_delete=models.CASCADE, db_column='account_id', unique=True)
    name = models.CharField(max_length=50)
    stocks = models.ManyToManyField('Stock', through='WatchlistStock', related_name='watchlists')

    class Meta:
        db_table = 'watchlist'

    def __str__(self):
        return f"Watchlist for {self.account.name}"

class WatchlistStock(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, db_column='watchlist_id')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, db_column='stock_symbol')

    class Meta:
        db_table = 'watchlist_stock'
