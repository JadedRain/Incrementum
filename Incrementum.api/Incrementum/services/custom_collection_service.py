from Incrementum.get_stock_info import fetch_stock_data
from Incrementum.models import StockModel, CustomCollection, CustomCollectionStock


class CustomCollectionService:
    """DB-backed custom collection service.

    Collection is user-specific; callers must pass account_api_key into each method.
    """
    def _get_account(self, account_api_key: str):
        from Incrementum.models_user import Account
        if not account_api_key:
            raise ValueError("account_api_key is required")
        try:
            return Account.objects.get(api_key=account_api_key)
        except Account.DoesNotExist:
            raise ValueError(f"Account with api_key {account_api_key} does not exist")

    def _get_or_create_collection_for_account(self, collection_name, account, symbols=None):
        collection, created = CustomCollection.objects.get_or_create(
            collection_name=collection_name,
            account=account,
        )
        if created or not collection.stocks.exists():
            if symbols is None:
                raise ValueError("symbols list is required to create/seed a collection")
            if not isinstance(symbols, (list, tuple)) or len(symbols) == 0:
                raise ValueError("symbols must be a non-empty list when creating a collection")
            for sym in symbols:
                stock, _ = StockModel.objects.get_or_create(symbol=sym, defaults={'company_name': sym})
                CustomCollectionStock.objects.get_or_create(collection=collection, stock=stock)
        return collection

    def get_stocks(self, account_api_key: str, collection_name: str = 'default'):
        account = self._get_account(account_api_key)
        collection = CustomCollection.objects.get(collection_name=collection_name, account=account)
        symbols = collection.stocks.values_list('symbol', flat=True)
        return [fetch_stock_data(symbol).to_dict() for symbol in symbols]

    def add_stock(self, token: str, account_api_key: str, collection_name: str = 'default', symbols=None) -> None:
        account = self._get_account(account_api_key)
        collection = self._get_or_create_collection_for_account(collection_name, account, symbols)
        stock, _ = StockModel.objects.get_or_create(symbol=token, defaults={'company_name': token})
        CustomCollectionStock.objects.get_or_create(collection=collection, stock=stock)

    def remove_stock(self, token: str, account_api_key: str, collection_name: str = 'default') -> None:
        account = self._get_account(account_api_key)
        try:
            collection = CustomCollection.objects.get(collection_name=collection_name, account=account)
        except CustomCollection.DoesNotExist:
            return
        try:
            stock = StockModel.objects.get(symbol=token)
        except StockModel.DoesNotExist:
            return
        CustomCollectionStock.objects.filter(collection=collection, stock=stock).delete()

    def aggregate_data(self, account_api_key: str, collection_name: str = 'default'):
        stock_objs = self.get_stocks(account_api_key, collection_name)
        aggregate = {}
        if stock_objs:
            aggregate['count'] = len(stock_objs)
            aggregate['symbols'] = [s.get('symbol') for s in stock_objs]
            aggregate['names'] = [s.get('shortName') or s.get('company_name') for s in stock_objs]
            market_caps = [s.get('marketCap') for s in stock_objs if s.get('marketCap') is not None]
            aggregate['marketCaps'] = market_caps
            aggregate['avgMarketCap'] = (sum(market_caps) / len(market_caps)) if market_caps else None
        return {"tokens": stock_objs, "aggregate": aggregate}
