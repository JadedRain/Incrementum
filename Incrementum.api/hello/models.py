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
        unique_together = (('watchlist', 'stock'),)
        managed = True


class Screener(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=300, blank=True, null=True)

    class Meta:
        db_table = 'screener'

    def __str__(self):
        return self.name


class WatchlistScreener(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, db_column='watchlist_id')
    screener = models.ForeignKey(Screener, on_delete=models.CASCADE, db_column='screener_id')

    class Meta:
        db_table = 'watchlist_screener'
        unique_together = (('watchlist', 'screener'),)


class CustomScreener(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, db_column='account_id')
    screener_name = models.CharField(max_length=100, default='Untitled Screener')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'custom_screener'

    def __str__(self):
        return f"Custom Screener {self.id} by {self.account.name}"


class NumericFilter(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)

    class Meta:
        db_table = 'numeric_filter'

    def __str__(self):
        return self.name


class CustomScreenerNumeric(models.Model):
    custom_screener = models.ForeignKey(CustomScreener, on_delete=models.CASCADE, db_column='custom_screener_id')
    numeric_filter = models.ForeignKey(NumericFilter, on_delete=models.CASCADE, db_column='numeric_filter_id')
    numeric_value = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'custom_screener_numeric'
        unique_together = (('custom_screener', 'numeric_filter'),)


class CategoricalFilter(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)

    class Meta:
        db_table = 'categorical_filter'

    def __str__(self):
        return self.name


class CustomScreenerCategorical(models.Model):
    custom_screener = models.ForeignKey(CustomScreener, on_delete=models.CASCADE, db_column='custom_screener_id')
    categorical_filter = models.ForeignKey(CategoricalFilter, on_delete=models.CASCADE, db_column='categorical_filter_id')
    category_value = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'custom_screener_categorical'
        unique_together = (('custom_screener', 'categorical_filter'),)


class WatchlistCustomScreener(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, db_column='watchlist_id')
    custom_screener = models.ForeignKey(CustomScreener, on_delete=models.CASCADE, db_column='custom_screener_id')

    class Meta:
        db_table = 'watchlist_custom_screener'
        unique_together = (('watchlist', 'custom_screener'),)
