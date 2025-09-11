from .get_stock_info import fetch_stock_data
from .stocks_class import Stock

class WatchlistService:
    def __init__(self):
        self.watchlist = []

    def add(self, symbol):
        if symbol and symbol not in self.watchlist:
            self.watchlist.append(symbol)
        return self.watchlist

    def get(self):
        stocks = []
        for symbol in self.watchlist:
            stock_obj = fetch_stock_data(symbol)
            stocks.append(stock_obj.to_dict())
        return stocks

    def remove(self, symbol):
        self.watchlist = [s for s in self.watchlist if s != symbol]
        return self.watchlist
