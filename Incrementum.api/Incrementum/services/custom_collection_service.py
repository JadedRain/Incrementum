from Incrementum.get_stock_info import fetch_stock_data
from Incrementum.models.stock import StockModel
from Incrementum.models.custom_collection import CustomCollection
from Incrementum.models.custom_collection_stock import CustomCollectionStock
from django.db import connection
from django.db.utils import IntegrityError


class CustomCollectionService:
    def _get_account(self, account_api_key: str):
        from Incrementum.models.account import Account
        if not account_api_key:
            raise ValueError("account_api_key is required")
        try:
            return Account.objects.get(api_key=account_api_key)
        except Account.DoesNotExist:
            raise ValueError(f"Account with api_key {account_api_key} does not exist")

    def _get_or_create_collection_for_account(
            self,
            collection_name,
            account,
            desc=None,
            symbols=None):
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
            if not isinstance(symbols, (list, tuple)):
                raise ValueError("symbols must be a list when creating a collection")
            for sym in symbols:
                stock, _ = StockModel.objects.get_or_create(
                    symbol=sym,
                    defaults={'company_name': sym}
                )
                qs = CustomCollectionStock.objects.filter(
                    collection=collection,
                    stock=stock
                )
                if not qs.exists():
                    try:
                        CustomCollectionStock.objects.create(collection=collection, stock=stock)
                    except Exception as e:
                        msg = str(e) or ''
                        if ('custom_collection_stock.id' in msg or 'RETURNING' in msg
                                or 'UndefinedColumn' in msg):
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
        try:
            collection = CustomCollection.objects.get(collection_name=collection_name,
                                                      account=account)
        except CustomCollection.DoesNotExist:
            return []
        stocks = []
        for stock_obj in collection.stocks.all():
            symbol = stock_obj.symbol
            try:
                data = fetch_stock_data(symbol)
                try:
                    stocks.append(data.to_dict())
                except Exception:
                    if isinstance(data, dict):
                        stocks.append(data)
                    else:
                        stocks.append({'symbol': symbol, 'company_name': stock_obj.company_name})
            except Exception:
                stocks.append({'symbol': symbol, 'company_name': stock_obj.company_name})
        return stocks

    def add_stocks(
            self,
            account_api_key: str,
            collection_name: str = 'default',
            symbols=None,
            desc=None) -> int:
        if not symbols:
            return 0
        account = self._get_account(account_api_key)
        collection = self._get_or_create_collection_for_account(
            collection_name,
            account, desc,
            symbols)
        added_count = 0
        for sym in symbols:
            try:
                stock = StockModel.objects.get(symbol=sym)
            except StockModel.DoesNotExist:
                continue
            if not CustomCollectionStock.objects.filter(
                    collection=collection,
                    stock=stock
            ).exists():
                try:
                    CustomCollectionStock.objects.create(collection=collection, stock=stock)
                    added_count += 1
                except Exception as e:
                    msg = str(e) or ''
                    if ('custom_collection_stock.id' in msg or 'RETURNING' in msg
                            or 'UndefinedColumn' in msg):
                        sql = """
                        INSERT INTO custom_collection_stock (collection_id, stock_symbol)
                        VALUES (%s, %s)
                        ON CONFLICT (collection_id, stock_symbol) DO NOTHING
                        """
                        try:
                            with connection.cursor() as cur:
                                cur.execute(sql, [collection.id, stock.symbol])
                                if cur.rowcount > 0:
                                    added_count += 1
                        except IntegrityError:
                            pass
                    else:
                        raise
        return added_count

    def remove_stocks(
            self,
            symbols,
            account_api_key: str,
            collection_name: str = 'default') -> None:
        if not symbols:
            return
        if isinstance(symbols, str):
            symbols = [symbols]

        account = self._get_account(account_api_key)
        try:
            collection = CustomCollection.objects.get(
                collection_name=collection_name,
                account=account)
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
            collection = CustomCollection.objects.get(
                collection_name=collection_name,
                account=account)
        except CustomCollection.DoesNotExist:
            return
        CustomCollectionStock.objects.filter(collection=collection).delete()
        CustomCollection.objects.filter(collection_name=collection_name).delete()

    def update_collection(self, api_key, collection_name, new_name=None, new_desc=None):
        account = self._get_account(api_key)
        try:
            collection = CustomCollection.objects.get(
                collection_name=collection_name,
                account=account)
        except CustomCollection.DoesNotExist:
            raise ValueError(f"Collection '{collection_name}' not found")

        # Check if new name already exists (if changing name)
        if new_name and new_name != collection_name:
            if CustomCollection.objects.filter(collection_name=new_name, account=account).exists():
                raise ValueError(f"Collection '{new_name}' already exists")
            collection.collection_name = new_name

        # Update description if provided
        if new_desc is not None:
            collection.c_desc = new_desc

        collection.save()
        return collection

    def aggregate_data(self, account_api_key: str, collection_name: str = 'default'):
        stock_objs = self.get_stocks(account_api_key, collection_name)
        aggregate = {}
        if stock_objs:
            aggregate['count'] = len(stock_objs)
            aggregate['symbols'] = [s.get('symbol') for s in stock_objs]
            aggregate['names'] = [s.get('shortName') or s.get('company_name') for s in stock_objs]
            market_caps = [s.get('marketCap') for s in stock_objs if s.get('marketCap') is not None]
            aggregate['marketCaps'] = market_caps
            avg_market_cap = None
            if market_caps:
                avg_market_cap = sum(market_caps) / len(market_caps)
            aggregate['avgMarketCap'] = avg_market_cap
        return {"tokens": stock_objs, "aggregate": aggregate}
