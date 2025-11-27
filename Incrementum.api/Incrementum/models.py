from django.db import models
from django.utils import timezone
from .models_user import Account


class StockModel(models.Model):
    symbol = models.CharField(max_length=10, primary_key=True)
    company_name = models.CharField(max_length=100)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'stock'

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"

    def to_dict(self):
        return {
            'symbol': self.symbol,
            'company_name': self.company_name,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class StockHistory(models.Model):
    stock_symbol = models.ForeignKey(
        StockModel,
        on_delete=models.CASCADE,
        db_column='stock_symbol',
        to_field='symbol'
    )
    day_and_time = models.DateTimeField()
    open_price = models.IntegerField()
    close_price = models.IntegerField()
    high = models.IntegerField()
    low = models.IntegerField()
    volume = models.IntegerField()

    class Meta:
        db_table = 'stock_history'
        managed = False

    def __str__(self):
        return f"{self.stock_symbol} - {self.day_and_time}"


class Watchlist(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.OneToOneField(
        Account,
        on_delete=models.CASCADE,
        db_column='account_id',
        unique=True,
    )
    name = models.CharField(max_length=50)
    stocks = models.ManyToManyField(
        'StockModel',
        through='WatchlistStock',
        related_name='watchlists',
    )

    class Meta:
        db_table = 'watchlist'

    def __str__(self):
        return f"Watchlist for {self.account.name}"


class WatchlistStock(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, db_column='watchlist_id')
    stock = models.ForeignKey(StockModel, on_delete=models.CASCADE, db_column='stock_symbol')

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
    filters = models.JSONField(default=list, blank=True)

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
    custom_screener = models.ForeignKey(
        CustomScreener,
        on_delete=models.CASCADE,
        db_column='custom_screener_id'
    )
    numeric_filter = models.ForeignKey(
        NumericFilter,
        on_delete=models.CASCADE,
        db_column='numeric_filter_id'
    )
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
    custom_screener = models.ForeignKey(
        CustomScreener,
        on_delete=models.CASCADE,
        db_column='custom_screener_id'
    )
    categorical_filter = models.ForeignKey(
        CategoricalFilter,
        on_delete=models.CASCADE,
        db_column='categorical_filter_id'
    )
    category_value = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'custom_screener_categorical'
        unique_together = (('custom_screener', 'categorical_filter'),)


class WatchlistCustomScreener(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, db_column='watchlist_id')
    custom_screener = models.ForeignKey(
        CustomScreener,
        on_delete=models.CASCADE,
        db_column='custom_screener_id',
    )

    class Meta:
        db_table = 'watchlist_custom_screener'
        unique_together = (('watchlist', 'custom_screener'),)


class CustomCollection(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        db_column='account_id',
        null=True,
        blank=True
    )
    collection_name = models.CharField(max_length=20)
    c_desc = models.CharField(max_length=300, null=True, blank=True)
    # store per-symbol metadata such as purchase prices
    purchase_prices = models.JSONField(default=dict, blank=True)
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


class CustomCollectionStock(models.Model):
    collection = models.ForeignKey(
        CustomCollection,
        on_delete=models.CASCADE,
        db_column='collection_id'
    )
    stock = models.ForeignKey(StockModel, on_delete=models.CASCADE, db_column='stock_symbol')

    class Meta:
        db_table = 'custom_collection_stock'
        unique_together = (('collection', 'stock'),)
        managed = False


Stock = StockModel
