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
        stocks = []
        # iterate StockModel instances so we can fallback to DB values if external fetch fails
        for stock_obj in collection.stocks.all():
            symbol = stock_obj.symbol
            try:
                data = fetch_stock_data(symbol)
                # fetch_stock_data should return a Stock object with to_dict
                try:
                    stocks.append(data.to_dict())
                except Exception:
                    # If data isn't the expected object, accept dicts
                    if isinstance(data, dict):
                        stocks.append(data)
                    else:
                        stocks.append({'symbol': symbol, 'company_name': stock_obj.company_name})
            except Exception:
                # External fetch failed (network/yfinance). Fall back to DB values.
                stocks.append({'symbol': symbol, 'company_name': stock_obj.company_name})
        return stocks

    def add_stocks(self, account_api_key: str, collection_name: str = 'default', symbols=None) -> None:
        if not symbols:
            return
        account = self._get_account(account_api_key)
        collection = self._get_or_create_collection_for_account(collection_name, account, symbols)
        for sym in symbols:
            try:
                stock = StockModel.objects.get(symbol=sym)
            except StockModel.DoesNotExist:
                continue
            CustomCollectionStock.objects.get_or_create(collection=collection, stock=stock)

    def remove_stocks(self, symbols, account_api_key: str, collection_name: str = 'default') -> None:
        if not symbols:
            return
        # normalize to list if a single symbol string was passed
        if isinstance(symbols, str):
            symbols = [symbols]

        account = self._get_account(account_api_key)
        try:
            collection = CustomCollection.objects.get(collection_name=collection_name, account=account)
        except CustomCollection.DoesNotExist:
            return
        for sym in symbols:
            try:
                stock = StockModel.objects.get(symbol=sym)
            except StockModel.DoesNotExist:
                continue
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
