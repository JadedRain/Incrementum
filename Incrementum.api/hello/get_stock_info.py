import pandas as pd
import yfinance as yf
import os
from .stocks_class import Stock
import json
import logging
import io
import matplotlib.pyplot as plt

def generate_stock_graph(history, ticker: str, period) -> bytes:
    """Generate a PNG graph from stock history with rudimentary styling and return raw image bytes."""
    # Determine trend
    first_price = history['Close'].iloc[0]
    last_price = history['Close'].iloc[-1]
    color = "green" if last_price >= first_price else "red"

    fig, ax = plt.subplots(figsize=(8, 4))

    # Plot with trend color and some styling
    history['Close'].plot(
        ax=ax, 
        title=f"{ticker} Closing Prices {period}", 
        color=color, 
        linewidth=2
    )

    ax.set_xlabel("Date")
    ax.set_ylabel("Price ($)")
    ax.grid(True, linestyle="--", alpha=0.6)  # light dashed grid
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight", dpi=120)
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
def get_stock_info(max, offset):
    tickers = setup()
    stocks = []
    max = int(max)
    offset = int(offset)
    for _, stock in tickers.iloc[offset:offset+max].iterrows():
        stocks.append(fetch_stock_data(stock['symbol']))
    return stocks

def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    return Stock(stock.info)