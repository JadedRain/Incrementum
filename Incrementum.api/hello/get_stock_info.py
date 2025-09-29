import pandas as pd
import yfinance as yf
import os
from .stocks_class import Stock
import json
import logging
import io
import matplotlib.pyplot as plt
from django.db import connection

def generate_stock_graph(history, ticker: str, period) -> bytes:
    """Generate a PNG graph from stock history with rudimentary styling and return raw image bytes."""
    
    first_price = history['Close'].iloc[0]
    last_price = history['Close'].iloc[-1]
    color = "green" if last_price >= first_price else "red"

    fig, ax = plt.subplots(figsize=(8, 4))

    history['Close'].plot(
        ax=ax, 
        title=f"{ticker} Closing Prices {period}", 
        color=color, 
        linewidth=2
    )

    ax.set_xlabel("Date")
    ax.set_ylabel("Price ($)")
    ax.grid(True, linestyle="--", alpha=0.6)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight", dpi=120)
    buffer.seek(0)
    plt.close(fig)
    return buffer.getvalue()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


def setup():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CSV_PATH = os.path.join(BASE_DIR, 'data', 'ticker_info.csv')
    tickers = pd.read_csv(CSV_PATH, index_col=0)
    return tickers

def search_stocks(query, page, source=setup):
    tickers = source()
    logging.info(f"Searching for stocks with query: {query}")
    results = []
    query = query.lower()
    for _, stock in tickers.iterrows():
        symbol = str(stock['symbol'])
        name = str(stock['companyName'])
        if symbol.lower().startswith(query):
            results.append({'symbol': symbol, 'name': name})
    for _, stock in tickers.iterrows():
        symbol = str(stock['symbol'])
        name = str(stock['companyName'])
        if not symbol.lower().startswith(query) and query in name.lower():
            results.append({'symbol': symbol, 'name': name})
    start = 10 * page
    end = min(start + 10, len(results))
    return results[start:end]

def get_stock_by_ticker(ticker, source=setup):
    tickers = source()
    stock_row = tickers[tickers['symbol'].str.lower() == ticker.lower()]
    if stock_row.empty:
        logging.warning(f"No stock found for ticker: {ticker}")
        return None
    stock_data = fetch_stock_data(ticker)
    return stock_data

def get_stock_info(max, offset, filters=None, source=setup):
    tickers = source()
    stocks = []
    max = int(max)
    offset = int(offset)

    allowed_sectors = None
    if isinstance(filters, dict):
        fs = filters.get('sectors')
        if fs:
            fs_set = {str(s).strip().lower() for s in fs if s}
            if allowed_sectors:
                allowed_sectors = allowed_sectors.union(fs_set)
            else:
                allowed_sectors = fs_set

    allowed_industries = None
    if isinstance(filters, dict):
        fi = filters.get('industries')
        if fi:
            allowed_industries = {str(s).strip().lower() for s in fi if s}

    if allowed_sectors:
        if 'sectorKey' in tickers.columns:
            tickers = tickers[tickers['sectorKey'].fillna('').str.lower().isin(allowed_sectors)]

    if allowed_industries:
        if 'industryKey' in tickers.columns:
            tickers = tickers[tickers['industryKey'].fillna('').str.lower().isin(allowed_industries)]

    for _, stock in tickers.iloc[offset:offset+max].iterrows():
        stocks.append(fetch_stock_data(stock['symbol']))
    return stocks


def ensure_stock_in_db(symbol, company_name):
    with connection.cursor() as cursor:
        cursor.execute("SELECT symbol FROM stock WHERE symbol = %s", [symbol])
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(
                "INSERT INTO stock (symbol, company_name) VALUES (%s, %s)",
                [symbol, company_name]
            )

def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    info = stock.info
    symbol = info.get('symbol', ticker)
    company_name = info.get('longName') or info.get('shortName') or symbol
    ensure_stock_in_db(symbol, company_name)
    return Stock(info)