import pandas as pd
import yfinance as yf
import os
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Minimum level to capture (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format="%(asctime)s - %(levelname)s - %(message)s"
)


def setup():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CSV_PATH = os.path.join(BASE_DIR, 'data', 'ticker_info.csv')
    tickers = pd.read_csv(CSV_PATH, index_col=0)
    return tickers

def search_stocks(query, source=setup):
    tickers = source()
    logging.info(f"Searching for stocks with query: {query}")
    results = []
    query = query.lower()
    for _, stock in tickers.iterrows():
        symbol = str(stock['symbol'])
        name = str(stock['companyName'])
        if query.lower() in symbol.lower() or query.lower() in name.lower():
            logging.info(f"Match found: {symbol} - {name}")
            results.append({
                'symbol': symbol,
                'name': name,
            })
    return results

def get_stock_info(max, offset):
    tickers = setup()
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