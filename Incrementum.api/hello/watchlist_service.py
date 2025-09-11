from .get_stock_info import fetch_stock_data
from .stocks_class import Stock

class WatchlistService:
    def __init__(self):
        self.watchlist = []

    def add(self, symbol):
        if symbol and not any(s.symbol == symbol for s in self.watchlist):
            stock_obj = fetch_stock_data(symbol)
            self.watchlist.append(stock_obj)
        return [s.to_dict() for s in self.watchlist]

    def get(self):
        return [s.to_dict() for s in self.watchlist]

    def remove(self, symbol):
        self.watchlist = [s for s in self.watchlist if s.symbol != symbol]
        return [s.to_dict() for s in self.watchlist]
