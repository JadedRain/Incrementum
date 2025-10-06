import logging
from .models import CustomScreener, WatchlistCustomScreener
from .get_stock_info import fetch_stock_data
from .models import Watchlist, Stock, WatchlistStock, Screener, WatchlistScreener
from django.db import transaction
from .models_user import Account

class WatchlistService:
    def __init__(self, fetch_stock_data_func=fetch_stock_data):
        self.fetch_stock_data_func = fetch_stock_data_func

    def add(self, user_id, symbol):
        account = Account.objects.get(api_key=user_id)
        watchlist, _ = Watchlist.objects.get_or_create(account=account, defaults={"name": f"{account.name}'s Watchlist"})
        stock, _ = Stock.objects.get_or_create(symbol=symbol, defaults={"company_name": symbol})
        WatchlistStock.objects.get_or_create(watchlist=watchlist, stock=stock)
        logging.info(f"Added {symbol} to user {user_id} watchlist.")
        return self.get(user_id)

    def get(self, user_id):
        account = Account.objects.get(api_key=user_id)
        watchlist, created = Watchlist.objects.get_or_create(account=account)

        symbols = watchlist.stocks.values_list('symbol', flat=True)
        return [self.fetch_stock_data_func(symbol).to_dict() for symbol in symbols]

    def remove(self, user_id, symbol):
        account = Account.objects.get(api_key=user_id)
        watchlist, created = Watchlist.objects.get_or_create(account=account)
        stock = Stock.objects.get(symbol=symbol)

        WatchlistStock.objects.filter(watchlist=watchlist, stock=stock).delete()
        logging.info(f"Removed {symbol} from user {user_id} watchlist.")
        return self.get(user_id)

    def search(self, user_id, query, max_results=10):
        account = Account.objects.get(api_key=user_id)
        watchlist = Watchlist.objects.get(account=account)

        query = query.lower()
        results = []
        for stock in watchlist.stocks.all():
            if query in stock.symbol.lower():
                results.append(self.fetch_stock_data_func(stock.symbol).to_dict())
            if len(results) >= max_results:
                break
        return results

    def add_screener(self, user_id, screener_id):
        account = Account.objects.get(api_key=user_id)
        watchlist = Watchlist.objects.get(account=account)
        screener = Screener.objects.get(id=screener_id)
        
        _, created = WatchlistScreener.objects.get_or_create(
            watchlist=watchlist,
            screener=screener
        )
        
        if created:
            logging.info(f"Added screener '{screener.name}' to user {user_id} watchlist.")
        else:
            logging.info(f"Screener '{screener.name}' already in user {user_id} watchlist.")
        
        return True

    def remove_screener(self, user_id, screener_id):
        account = Account.objects.get(api_key=user_id)
        watchlist = Watchlist.objects.get(account=account)
        screener = Screener.objects.get(id=screener_id)
        
        deleted_count, _ = WatchlistScreener.objects.filter(
            watchlist=watchlist,
            screener=screener
        ).delete()
        
        if deleted_count > 0:
            logging.info(f"Removed screener '{screener.name}' from user {user_id} watchlist.")
            return True
        else:
            logging.info(f"Screener '{screener.name}' was not in user {user_id} watchlist.")
            return False

    def get_screeners(self, user_id):
        account = Account.objects.get(api_key=user_id)
        watchlist = Watchlist.objects.get(account=account)
        
        screeners = []
        for ws in WatchlistScreener.objects.filter(watchlist=watchlist):
            screeners.append({
                'id': ws.screener.id,
                'name': ws.screener.name,
                'description': ws.screener.description,
                'type': 'prebuilt'
            })
        
        return screeners

    def add_custom_screener(self, user_id, custom_screener_id):
        from .models import CustomScreener, WatchlistCustomScreener
        
        try:
            account = Account.objects.get(api_key=user_id)
            watchlist, _ = Watchlist.objects.get_or_create(
                account=account, 
                defaults={"name": f"{account.name}'s Watchlist"}
            )
            
            # Verify the custom screener belongs to this user
            custom_screener = CustomScreener.objects.get(
                id=custom_screener_id, 
                account=account
            )
            
            _, created = WatchlistCustomScreener.objects.get_or_create(
                watchlist=watchlist,
                custom_screener=custom_screener
            )
            
            if created:
                logging.info(f"Added custom screener {custom_screener_id} to user {user_id} watchlist.")
            else:
                logging.info(f"Custom screener {custom_screener_id} already in user {user_id} watchlist.")
            
            return True
            
        except (Account.DoesNotExist, CustomScreener.DoesNotExist):
            logging.error(f"Failed to add custom screener {custom_screener_id} to user {user_id} watchlist.")
            return False

    def remove_custom_screener(self, user_id, custom_screener_id):
        from .models import CustomScreener, WatchlistCustomScreener
        
        try:
            account = Account.objects.get(api_key=user_id)
            watchlist = Watchlist.objects.get(account=account)
            custom_screener = CustomScreener.objects.get(
                id=custom_screener_id, 
                account=account
            )
            
            deleted_count, _ = WatchlistCustomScreener.objects.filter(
                watchlist=watchlist,
                custom_screener=custom_screener
            ).delete()
            
            if deleted_count > 0:
                logging.info(f"Removed custom screener {custom_screener_id} from user {user_id} watchlist.")
                return True
            else:
                logging.info(f"Custom screener {custom_screener_id} was not in user {user_id} watchlist.")
                return False
                
        except (Account.DoesNotExist, Watchlist.DoesNotExist, CustomScreener.DoesNotExist):
            logging.error(f"Failed to remove custom screener {custom_screener_id} from user {user_id} watchlist.")
            return False

    def get_custom_screeners(self, user_id):
        from .models import WatchlistCustomScreener
        try:
            account = Account.objects.get(api_key=user_id)
            watchlist = Watchlist.objects.get(account=account)
            
            custom_screeners = []
            for wcs in WatchlistCustomScreener.objects.filter(watchlist=watchlist):
                custom_screeners.append({
                    'id': wcs.custom_screener.id,
                    'created_at': wcs.custom_screener.created_at,
                    'type': 'custom'
                })
        except (Account.DoesNotExist, Watchlist.DoesNotExist):
            custom_screeners = []            

        return custom_screeners

    def get_all_screeners(self, user_id):
        prebuilt_screeners = self.get_screeners(user_id)
        custom_screeners = self.get_custom_screeners(user_id)

        return {
            'prebuilt_screeners': prebuilt_screeners,
            'custom_screeners': custom_screeners
        }
