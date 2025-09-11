import pandas as pd
import yfinance as yf
import os
from .stocks_class import Stock


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'data', 'ticker_info.csv')
tickers = pd.read_csv(CSV_PATH, index_col=0)


def get_stock_info(max, offset):
    stocks = []
    max = int(max)
    offset = int(offset)
    for _, stock in tickers.iloc[offset:offset+max].iterrows():
        stocks.append(fetch_stock_data(stock['symbol']))
    return stocks

def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    return Stock(stock.info)