import pandas as pd
import yfinance as yf
import os
import json
from .stocks_class import Stock


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'data', 'ticker_info.csv')
tickers = pd.read_csv(CSV_PATH, index_col=0)
def search_stocks(query):
    results = []
    query = query.lower()
    for _, stock in tickers.iterrows():
        if query in stock['symbol'].lower() or query in stock['name'].lower():
            results.append({
                'symbol': stock['symbol'],
                'name': stock['name']
            })
    return results

def get_stock_info(max, offset):
    stocks = []
    # Ensure max and offset are integers
    max = int(max)
    offset = int(offset)
    # Use iloc to slice, then iterrows to get row as Series
    for _, stock in tickers.iloc[offset:offset+max].iterrows():
        stocks.append(Stock(fetch_stock_data(stock['symbol'])))
    return stocks

def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    return stock.info