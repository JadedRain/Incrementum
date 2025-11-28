import logging
from Incrementum.get_stock_info import fetch_stock_data
from Incrementum.models import StockModel, CustomCollection
from Incrementum.models_user import Account
from Incrementum.services.custom_collection_service import CustomCollectionService


class WatchlistService:
    def __init__(self, fetch_stock_data_func=fetch_stock_data):
        self.fetch_stock_data_func = fetch_stock_data_func
        self.serv = CustomCollectionService()

    def add(self, user_id, symbol):
        try:
            Account.objects.get(api_key=user_id)
        except Account.DoesNotExist:
            logging.error(f"Account with api_key {user_id} does not exist.")
            return []
        stock, _ = StockModel.objects.get_or_create(
            symbol=symbol,
            defaults={"company_name": symbol},
        )
        self.serv.add_stocks(
            collection_name="Default Collection",
            account_api_key=user_id,
            symbols=[symbol]
        )
        print("adding to watchlist")
        logging.info(f"Added {symbol} to user {user_id} watchlist.")
        return self.get(user_id)

    def get(self, user_id):
        try:
            account = Account.objects.get(api_key=user_id)
            watchlist = self.serv._get_or_create_collection_for_account(
                collection_name="Default Collection",
                account=account
            )
        except (Account.DoesNotExist):
            print("getting empty watchlist")
            return []
        symbols = watchlist.stocks.values_list('symbol', flat=True)
        return [self.fetch_stock_data_func(symbol).to_dict() for symbol in symbols]

    def remove(self, user_id, symbol):
        self.serv.remove_stocks(
            collection_name="Default Collection",
            account_api_key=user_id,
            symbols=[symbol]
        )
        logging.info(f"Removed {symbol} from user {user_id} watchlist.")
        return self.get(user_id)

    def search(self, user_id, query, max_results=10):
        try:
            account = Account.objects.get(api_key=user_id)
            watchlist = self.serv._get_or_create_collection_for_account(
                collection_name="Default Collection",
                account=account
            )
        except (Account.DoesNotExist):
            return []
        query = query.lower()
        results = []
        for stock in watchlist.stocks.all():
            if query in stock.symbol.lower():
                results.append(self.fetch_stock_data_func(stock.symbol).to_dict())
            if len(results) >= max_results:
                break
        return results
