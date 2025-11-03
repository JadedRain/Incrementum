from hello.get_stock_info import fetch_stock_data
from hello.models import StockModel, CustomCollection, CustomCollectionStock


class CustomCollectionService:
    """DB-backed custom collection service.

    If `account_api_key` is provided, operates on the user-specific collection (create if missing).
    Otherwise it uses a default collection record (account is None) named by `collection_name`.
    """
    def __init__(self, collection_name: str = 'default', account_api_key: str | None = None):
        # Lazy import Account to avoid circular imports at module import time
        from hello.models_user import Account

        self.collection_name = collection_name
        self.account = None
        if account_api_key:
            try:
                self.account = Account.objects.get(api_key=account_api_key)
            except Account.DoesNotExist:
                self.account = None

        collection, created = CustomCollection.objects.get_or_create(
            collection_name=collection_name,
            defaults={'account': self.account}
        )

        # If there is already a collection with this name but different account, try to find the one matching account
        if self.account is not None:
            # prefer collection for this account
            coll_qs = CustomCollection.objects.filter(collection_name=collection_name, account=self.account)
            if coll_qs.exists():
                collection = coll_qs.first()

        # seed default stocks if newly created and empty
        self.collection = collection
        if created or not self.collection.stocks.exists():
            for sym in ['AAPL', 'MSFT', 'GOOGL']:
                stock, _ = StockModel.objects.get_or_create(symbol=sym, defaults={'company_name': sym})
                CustomCollectionStock.objects.get_or_create(collection=self.collection, stock=stock)

    def get_stocks(self):
        symbols = self.collection.stocks.values_list('symbol', flat=True)
        return [fetch_stock_data(symbol).to_dict() for symbol in symbols]

    def add_stock(self, token: str) -> None:
        stock, _ = StockModel.objects.get_or_create(symbol=token, defaults={'company_name': token})
        CustomCollectionStock.objects.get_or_create(collection=self.collection, stock=stock)

    def remove_stock(self, token: str) -> None:
        try:
            stock = StockModel.objects.get(symbol=token)
        except StockModel.DoesNotExist:
            return
        CustomCollectionStock.objects.filter(collection=self.collection, stock=stock).delete()

    def aggregate_data(self):
        stock_objs = self.get_stocks()
        aggregate = {}
        if stock_objs:
            aggregate['count'] = len(stock_objs)
            aggregate['symbols'] = [s.get('symbol') for s in stock_objs]
            aggregate['names'] = [s.get('shortName') or s.get('company_name') for s in stock_objs]
            market_caps = [s.get('marketCap') for s in stock_objs if s.get('marketCap') is not None]
            aggregate['marketCaps'] = market_caps
            aggregate['avgMarketCap'] = (sum(market_caps) / len(market_caps)) if market_caps else None
        return {"tokens": stock_objs, "aggregate": aggregate}
