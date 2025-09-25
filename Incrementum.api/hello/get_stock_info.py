import pandas as pd
import yfinance as yf
import os
from .stocks_class import Stock
import json
import logging
import io
import matplotlib.pyplot as plt

def generate_stock_graph(history, ticker: str) -> bytes:
    """Generate a PNG graph from stock history and return raw image bytes."""
    fig, ax = plt.subplots()
    history['Close'].plot(ax=ax, title=f"{ticker} Closing Prices (1Y)")
    ax.set_xlabel("Date")
    ax.set_ylabel("Price ($)")

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight")
    buffer.seek(0)
    plt.close(fig)
    return buffer.getvalue()
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

def search_stocks(query, page, source=setup):
    tickers = source()
    logging.info(f"Searching for stocks with query: {query}")
    results = []
    query = query.lower()
    for _, stock in tickers.iterrows():
        symbol = str(stock['symbol'])
        name = str(stock['companyName'])
        if query.lower() in symbol.lower() or query.lower() in name.lower():
            # logging.info(f"Match found: {symbol} - {name}")
            results.append({
                'symbol': symbol,
                'name': name,
            })
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
def get_stock_info(max, offset, sector=None, filters=None, source=setup):
    tickers = source()
    stocks = []
    max = int(max)
    offset = int(offset)
    # Build allowed sectors from both `sector` param and filters dict
    allowed_sectors = None
    if sector:
        allowed_sectors = {str(sector).strip().lower()}
    if isinstance(filters, dict):
        fs = filters.get('sectors')
        if fs:
            fs_set = {str(s).strip().lower() for s in fs if s}
            if allowed_sectors:
                allowed_sectors = allowed_sectors.union(fs_set)
            else:
                allowed_sectors = fs_set
    # Build allowed industries from filters dict
    allowed_industries = None
    if isinstance(filters, dict):
        fi = filters.get('industries')
        if fi:
            allowed_industries = {str(s).strip().lower() for s in fi if s}

    # Apply sector filtering if specified
    if allowed_sectors:
        # Ensure sectorKey exists and compare lowercase
        if 'sectorKey' in tickers.columns:
            tickers = tickers[tickers['sectorKey'].fillna('').str.lower().isin(allowed_sectors)]

    # Apply industry filtering if specified
    if allowed_industries:
        if 'industryKey' in tickers.columns:
            tickers = tickers[tickers['industryKey'].fillna('').str.lower().isin(allowed_industries)]

    # Apply filters only. Return rows in CSV order after filters are applied.

    for _, stock in tickers.iloc[offset:offset+max].iterrows():
        stocks.append(fetch_stock_data(stock['symbol']))
    return stocks

def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    return Stock(stock.info)