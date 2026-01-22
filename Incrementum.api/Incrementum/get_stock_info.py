from .stock_history_service import StockHistoryService
from .models.stock import StockModel
import yfinance as yf
from .stocks_class import Stock
import logging
from django.db import connection
from yfinance.screener.query import EquityQuery
from Screeners.moving_average_52 import fifty_two_high
from Screeners.numeric_screeners import NumericScreeners


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

    stock_data = fetch_stock_data(ticker)
    return stock_data


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


def get_stock_info(max, offset, filters=None, source=setup):
    max = int(max)
    offset = int(offset)

    # Handle percent change filtering first
    if (
        isinstance(filters, dict)
        and filters.get('percent_change_filter')
        and filters.get('percent_change_value') is not None
    ):
        percent_change_filter = filters.get('percent_change_filter')
        percent_change_value = float(filters.get('percent_change_value'))

        all_screened_stocks = screen_stocks_by_percent_change(
            percent_change_filter,
            percent_change_value,
            max_results=250
        )

        start = offset
        end = min(start + max, len(all_screened_stocks))
        return all_screened_stocks[start:end]

    if (
        isinstance(filters, dict)
        and filters.get('average_volume_filter')
        and filters.get('average_volume_value') is not None
    ):
        average_volume_filter = filters.get('average_volume_filter')
        average_volume_value = float(filters.get('average_volume_value'))

        all_screened_stocks = screen_stocks_by_average_volume(
            average_volume_filter,
            average_volume_value,
            max_results=250
        )

        start = offset
        end = min(start + max, len(all_screened_stocks))
        return all_screened_stocks[start:end]

    if isinstance(filters, dict) and filters.get('current_share_price') is not None:
        current_share_price = filters.get('current_share_price')

        all_screened_stocks = screen_stocks_by_current_share_price(
            current_share_price,
            max_results=250
        )

        start = offset
        end = min(start + max, len(all_screened_stocks))
        return all_screened_stocks[start:end]

    # DB-based filtering
    tickers = list(source())
    stocks = []

    # Sector filtering
    allowed_sectors = None
    if filters and filters.get('sectors'):
        fs_set = {str(s).strip().lower() for s in filters.get('sectors') if s}
        allowed_sectors = fs_set
        tickers = [
            t for t in tickers
            if hasattr(t, 'sectorKey') and str(getattr(t, 'sectorKey', '')).lower()
            in allowed_sectors
        ]

    # Industry filtering
    allowed_industries = None
    if filters and filters.get('industries'):
        fi_set = {str(s).strip().lower() for s in filters.get('industries') if s}
        allowed_industries = fi_set
        tickers = [
            t for t in tickers
            if hasattr(t, 'industryKey')
            and str(getattr(t, 'industryKey', '')).lower() in allowed_industries
        ]

    # Build Stock objects with historical prices
    for t in tickers[offset:offset+max]:
        stock_data = fetch_stock_data(t.symbol)  # must return a Stock object with historical prices
        stocks.append(stock_data)

    # Moving average filtering
    screeners_list = []
    if (
        filters
        and filters.get('price_52w_high')
        and filters.get('price_52w_high_value') is not None
    ):
        # You can optionally use the value as threshold, for now we filter by MA
        ma_screener = fifty_two_high(filters.get('price_52w_high_value'))
        screeners_list.append(ma_screener)

    if screeners_list:
        numeric_screeners = NumericScreeners(screeners_list)
        stocks = numeric_screeners.apply_screenings(stocks)

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
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        # Check if we got valid data
        if not info or info.get('regularMarketPrice') is None:
            # Sometimes yfinance returns empty dict for invalid tickers
            raise ValueError(f"Unable to fetch valid data for ticker: {ticker}")

        symbol = info.get('symbol', ticker)
        company_name = info.get('longName') or info.get('shortName') or symbol
        ensure_stock_in_db(symbol, company_name)
        return Stock(info)
    except Exception as e:
        logging.error(f"Error fetching stock data for {ticker}: {str(e)}")
        raise ValueError(f"Failed to fetch data for ticker {ticker}: {str(e)}")


def screen_stocks_by_percent_change(percent_change_filter, percent_change_value, max_results=100):
    valid_filters = ['gt', 'gte', 'lt', 'lte', 'eq']
    if percent_change_filter not in valid_filters:
        raise ValueError(f"Invalid percent_change_filter. Must be one of: {valid_filters}")

    # Ensure max_results doesn't exceed Yahoo's limit
    max_results = min(max_results, 250)

    query = EquityQuery('and', [
        EquityQuery(percent_change_filter, ['percentchange', percent_change_value]),
        EquityQuery('eq', ['region', 'us'])  # Limit to US stocks for consistency
    ])

    screen_results = yf.screen(query, size=max_results)

    quotes = screen_results.get('quotes', [])

    stocks = []
    for quote in quotes:
        try:
            symbol = quote.get('symbol')
            if symbol:
                stock_data = fetch_stock_data(symbol)
                stocks.append(stock_data)
        except Exception as e:
            logging.warning(
                "Failed to fetch data for symbol %s: %s", quote.get('symbol', 'unknown'), e
            )
            continue

    return stocks


def screen_stocks_by_average_volume(average_volume_filter, average_volume_value, max_results=100):
    valid_filters = ['gt', 'gte', 'lt', 'lte', 'eq']
    if average_volume_filter not in valid_filters:
        raise ValueError(f"Invalid average_volume_filter. Must be one of: {valid_filters}")

    max_results = min(max_results, 250)

    try:
        query = EquityQuery(average_volume_filter, ['avgdailyvol3m', average_volume_value])

        screen_results = yf.screen(query, size=max_results)

        quotes = screen_results.get('quotes', [])

        stocks = []
        for quote in quotes:
            try:
                symbol = quote.get('symbol')
                if symbol:
                    stock_data = fetch_stock_data(symbol)
                    stocks.append(stock_data)
            except Exception as e:
                logging.warning(
                    "Failed to fetch data for symbol %s: %s",
                    quote.get('symbol', 'unknown'), e
                )
                continue

        return stocks

    except Exception as e:
        logging.error(f"Error screening stocks by average volume: {e}")
        return []


def screen_stocks_by_current_share_price(price_filter, price_value, max_results=100):
    valid_filters = ['gt', 'gte', 'lt', 'lte', 'eq']

    if price_filter not in valid_filters:
        raise ValueError(f"Invalid current_share_price. Must be one of: {valid_filters}")

    max_results = min(max_results, 250)

    try:
        query = EquityQuery(price_filter, ['currentPrice', price_value])

        screen_results = yf.screen(query, size=max_results)

        quotes = screen_results.get('quotes', [])

        stocks = []
        for quote in quotes:
            try:
                symbol = quote.get('symbol')
                if symbol:
                    stock_data = fetch_stock_data(symbol)
                    stocks.append(stock_data)
            except Exception as e:
                sym = quote.get('symbol', 'unknown')
                logging.warning("Failed to fetch data for symbol %s: %s", sym, e)
                continue

        return stocks

    except Exception as e:
        logging.error(f"Error screening stocks by current share price: {e}")
        return []
