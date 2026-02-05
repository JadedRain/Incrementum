from .stock_history_service import StockHistoryService
from .models.stock import StockModel
from .stocks_class import Stock
import logging
from django.db import connection


def setup():
    return StockModel.objects.all()


def search_stocks(query, page, source=setup):
    tickers = source()
    logging.info(f"Searching for stocks with query: {query}")
    results = []
    query = query.lower()
    for stock in tickers:
        symbol = str(stock.symbol)
        name = str(stock.company_name)
        if symbol.lower().startswith(query):
            results.append({'symbol': symbol, 'name': name})
    for stock in tickers:
        symbol = str(stock.symbol)
        name = str(stock.company_name)
        if not symbol.lower().startswith(query) and query in name.lower():
            results.append({'symbol': symbol, 'name': name})
    return results


def get_stock_by_ticker(ticker, source=setup):
    tickers = source()

    if hasattr(tickers, 'filter'):
        stock_exists = tickers.filter(symbol__iexact=ticker).exists()
    else:
        stock_row = tickers[tickers['symbol'].str.lower() == ticker.lower()]
        stock_exists = not stock_row.empty

    if not stock_exists:
        logging.warning(f"No stock found in database for ticker: {ticker}")
        return None

    # Fetch directly from database instead of yfinance
    try:
        stock = StockModel.objects.get(symbol__iexact=ticker)
        return Stock(stock.to_dict())
    except StockModel.DoesNotExist:
        logging.warning(f"No stock found in database for ticker: {ticker}")
        return None


def fetch_stock_with_ma(symbol, ma_period=50):
    history_service = StockHistoryService()
    history_df, metadata = history_service.history(symbol, period="1y")
    hist = history_df['Close'] if history_df is not None else None  # last 1 year daily prices
    if hist is None:
        return None
    ma = hist.rolling(window=ma_period).mean()
    return {
        "symbol": symbol,
        "latest_price": hist.iloc[-1],
        f"MA_{ma_period}": ma.iloc[-1]
    }


def ensure_stock_in_db(symbol, company_name):
    with connection.cursor() as cursor:
        cursor.execute("SELECT symbol FROM stock WHERE symbol = %s", [symbol])
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(
                "INSERT INTO stock (symbol, company_name) VALUES (%s, %s)",
                [symbol, company_name]
            )
