import logging
import pandas as pd
import os
import datetime
from .get_stock_info import fetch_stock_data
from .stocks_class import Stock

class WatchlistService:
    def __init__(self, fetch_stock_data_func=fetch_stock_data):
        self.fetch_stock_data_func = fetch_stock_data_func
        self.watchlist = ["AAPL", "TSLA"]

        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(base_dir, 'data', 'ticker_info.csv')
        self.tickers = pd.read_csv(csv_path, index_col=0)

        self.tickerDateAdded = {
            "AAPL": datetime.datetime(2023, 1, 2),
            "TSLA": datetime.datetime(2023, 1, 3)
        }

    def add(self, symbol):
        if not symbol:
            return self.watchlist
        row = self.tickers[self.tickers['symbol'] == symbol]
        if not row.empty and symbol not in self.watchlist:
            self.watchlist.append(symbol)
            self.tickerDateAdded[symbol] = datetime.datetime.now()
            logging.info(f"Added {symbol}, watchlist: {self.watchlist}")
        return self.watchlist

    def get_sorted(self):
        stocks = [
            self.fetch_stock_data_func(symbol) for symbol in self.watchlist
        ]
        stocks.sort(
            key=lambda x: self.tickerDateAdded.get(x.symbol, datetime.datetime.min),
            reverse=True
        )
        return [stock.to_dict() for stock in stocks]

    def get(self):
        return [
            self.fetch_stock_data_func(symbol).to_dict()
            for symbol in self.watchlist
        ]

    def remove(self, symbol):
        self.watchlist = [item for item in self.watchlist if item != symbol]
        self.tickerDateAdded.pop(symbol, None)
        return self.watchlist

    def search(self, query, max_results=10):
        query = query.lower()
        results = []
        for symbol in self.watchlist:
            if query in symbol.lower():
                results.append(self.fetch_stock_data_func(symbol).to_dict())
            if len(results) >= max_results:
                break
        return results
