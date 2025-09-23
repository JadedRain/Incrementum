import pandas as pd
import os
from .get_stock_info import fetch_stock_data
from .stocks_class import Stock

class WatchlistService:
    def __init__(self):
        self.watchlist = ["AAPL", "TSLA"]  # list of dicts: {symbol, companyName}
        base_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(base_dir, 'data', 'ticker_info.csv')
        self.tickers = pd.read_csv(csv_path, index_col=0)

    def add(self, symbol):
        if not symbol:
            return self.watchlist
        row = self.tickers[self.tickers['symbol'] == symbol]
        if not row.empty:
            company_name = row.iloc[0]['companyName']
            if not any(item['symbol'] == symbol for item in self.watchlist):
                self.watchlist.append(symbol)
        return self.watchlist

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
            symbol = item['symbol']
            company_name = item['companyName']
            if query in symbol.lower() or query in company_name.lower():
                results.append(fetch_stock_data(symbol).to_dict())
            if len(results) >= max_results:
                break
        return results

    def get_sorted(self, reverse=False):
        sorted_list = sorted(self.watchlist, key=lambda x: x['companyName'].lower(), reverse=reverse)
        result = []
        for item in sorted_list:
            result.append(fetch_stock_data(item['symbol']).to_dict())
        return result