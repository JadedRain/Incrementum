from Incrementum.get_stock_info import fetch_stock_data
from Incrementum.models import StockModel, CustomCollection, CustomCollectionStock
from django.db import connection
from django.db.utils import ProgrammingError, IntegrityError


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

    def _get_or_create_collection_for_account(self, collection_name, account, desc=None, symbols=None):
        defaults = {}
        if desc is not None:
            defaults['c_desc'] = desc
        collection, created = CustomCollection.objects.get_or_create(
            collection_name=collection_name,
            account=account,
            defaults=defaults or None
        )
        if created or not collection.stocks.exists():
            if symbols is None:
                raise ValueError("symbols list is required to create/seed a collection")
            if not isinstance(symbols, (list, tuple)) or len(symbols) == 0:
                raise ValueError("symbols must be a non-empty list when creating a collection")
            for sym in symbols:
                stock, _ = StockModel.objects.get_or_create(symbol=sym, defaults={'company_name': sym})
                if not CustomCollectionStock.objects.filter(collection=collection, stock=stock).exists():
                    try:
                        CustomCollectionStock.objects.create(collection=collection, stock=stock)
                    except Exception as e:
                        msg = str(e) or ''
                        if 'custom_collection_stock.id' in msg or 'RETURNING' in msg or 'UndefinedColumn' in msg:
                            try:
                                sql = """
                                INSERT INTO custom_collection_stock (collection_id, stock_symbol)
                                VALUES (%s, %s)
                                ON CONFLICT (collection_id, stock_symbol) DO NOTHING
                                """
                                with connection.cursor() as cur:
                                    cur.execute(sql, [collection.id, stock.symbol])
                            except IntegrityError:
                                pass
                        else:
                            raise
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

    def add_stocks(self, account_api_key: str, collection_name: str = 'default', symbols=None, desc=None) -> None:
        if not symbols:
            return
        account = self._get_account(account_api_key)
        collection = self._get_or_create_collection_for_account(collection_name, account, desc, symbols)
        for sym in symbols:
            try:
                stock = StockModel.objects.get(symbol=sym)
            except StockModel.DoesNotExist:
                continue
            if not CustomCollectionStock.objects.filter(collection=collection, stock=stock).exists():
                try:
                    CustomCollectionStock.objects.create(collection=collection, stock=stock)
                except Exception as e:
                    msg = str(e) or ''
                    if 'custom_collection_stock.id' in msg or 'RETURNING' in msg or 'UndefinedColumn' in msg:
                        sql = """
                        INSERT INTO custom_collection_stock (collection_id, stock_symbol)
                        VALUES (%s, %s)
                        ON CONFLICT (collection_id, stock_symbol) DO NOTHING
                        """
                        try:
                            with connection.cursor() as cur:
                                cur.execute(sql, [collection.id, stock.symbol])
                        except IntegrityError:
                            pass
                    else:
                        raise

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
            
    def get_all_collections(self, api_key):
        account = self._get_account(api_key)
        collections = []
        for c in CustomCollection.objects.filter(account=account):
            collections.append({
                'id': c.id,
                'name': c.collection_name,
                'stocks': [s.symbol for s in c.stocks.all()],
                'c_desc': c.c_desc,
                'date_created': c.date_created
            })
        return collections
    
    def delete_collection(self, api_key, collection_name):
        account = self._get_account(api_key)
        try:
            collection = CustomCollection.objects.get(collection_name=collection_name, account=account)
        except CustomCollection.DoesNotExist:
            return
        CustomCollectionStock.objects.filter(collection=collection).delete()
        CustomCollection.objects.filter(collection_name=collection_name).delete()


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
