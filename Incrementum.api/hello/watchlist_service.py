import logging
import pandas as pd
import os
from .get_stock_info import fetch_stock_data
from .stocks_class import Stock
import datetime

class WatchlistService:
    def __init__(self):
        self.watchlist = ["AAPL", "TSLA"]
    def __init__(self, fetch_stock_data_func=fetch_stock_data):
        self.watchlist = ["AAPL", "TSLA"]  
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(base_dir, 'data', 'ticker_info.csv')
        self.tickers = pd.read_csv(csv_path, index_col=0)
        self.tickerDateAdded = {"AAPL": datetime("2023-01-01"), "TSLA": datetime("2023-01-02")}

    def add(self, symbol):
        if not symbol:
            return self.watchlist
        row = self.tickers[self.tickers['symbol'] == symbol]
        if not row.empty:
            if not any(item == symbol for item in self.watchlist):
                self.watchlist.append(symbol)
                logging.info(f"Made it to here {self.watchlist}")
                self.tickerDateAdded[symbol] = datetime.now()
        return self.watchlist
    def get_sorted(self):
        stocks = []
        for item in self.watchlist:
            stock_obj = self.fetch_stock_data_func(item)
            stocks.append(stock_obj)
        stocks.sort(key=lambda x: self.tickerDateAdded.get(x.symbol, datetime.min), reverse=True)
        return [stock.to_dict() for stock in stocks]
    def get(self):
        stocks = []
        for item in self.watchlist:
            stock_obj = fetch_stock_data(item)
            stocks.append(stock_obj.to_dict())
        return stocks

    def remove(self, symbol):
        self.watchlist = [item for item in self.watchlist if item != symbol]
        return self.watchlist

    def search(self, query, max_results=10):
        query = query.lower()
        results = []
        for item in self.watchlist:
            symbol = item
            if query in symbol.lower():
                results.append(self.fetch_stock_data_func(symbol).to_dict())
            if len(results) >= max_results:
                break
        return results