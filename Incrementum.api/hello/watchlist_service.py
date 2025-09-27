import logging
from .get_stock_info import fetch_stock_data
from .models import Watchlist, Stock, WatchlistStock
from django.db import transaction
from .models_user import Account

class WatchlistService:
    def __init__(self, fetch_stock_data_func=fetch_stock_data):
        self.fetch_stock_data_func = fetch_stock_data_func

    def add(self, user_id, symbol):
        try:
            account = Account.objects.get(api_key=user_id)
        except Account.DoesNotExist:
            logging.error(f"Account with api_key {user_id} does not exist.")
            return []
        watchlist, _ = Watchlist.objects.get_or_create(account=account, defaults={"name": f"{account.name}'s Watchlist"})
        stock, _ = Stock.objects.get_or_create(symbol=symbol, defaults={"company_name": symbol})
        WatchlistStock.objects.get_or_create(watchlist=watchlist, stock=stock)
        logging.info(f"Added {symbol} to user {user_id} watchlist.")
        return self.get(user_id)

    def get(self, user_id):
        try:
            account = Account.objects.get(api_key=user_id)
            watchlist = Watchlist.objects.get(account=account)
        except (Account.DoesNotExist, Watchlist.DoesNotExist):
            return []
        symbols = watchlist.stocks.values_list('symbol', flat=True)
        return [self.fetch_stock_data_func(symbol).to_dict() for symbol in symbols]

    def remove(self, user_id, symbol):
        try:
            account = Account.objects.get(api_key=user_id)
            watchlist = Watchlist.objects.get(account=account)
            stock = Stock.objects.get(symbol=symbol)
        except (Account.DoesNotExist, Watchlist.DoesNotExist, Stock.DoesNotExist):
            return self.get(user_id)
        WatchlistStock.objects.filter(watchlist=watchlist, stock=stock).delete()
        logging.info(f"Removed {symbol} from user {user_id} watchlist.")
        return self.get(user_id)

    def search(self, user_id, query, max_results=10):
        try:
            account = Account.objects.get(id=user_id)
            watchlist = Watchlist.objects.get(account=account)
        except (Account.DoesNotExist, Watchlist.DoesNotExist):
            return []
        query = query.lower()
        results = []
        for stock in watchlist.stocks.all():
            if query in stock.symbol.lower():
                results.append(self.fetch_stock_data_func(stock.symbol).to_dict())
            if len(results) >= max_results:
                break
        return results
