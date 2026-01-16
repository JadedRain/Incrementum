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
    try:
        from datetime import timedelta
        from django.utils import timezone

        try:
            stock_model = StockModel.objects.get(symbol__iexact=ticker)

            if stock_model.yfinance_data_updated_at:
                age = timezone.now() - stock_model.yfinance_data_updated_at
                if age < timedelta(minutes=5):
                    logging.info(
                        f"Returning cached data for {ticker} (age: {age})"
                    )
                    return stock_model_to_stock(stock_model)
                else:
                    logging.info(
                        f"Cached data for {ticker} is stale "
                        f"(age: {age}), fetching fresh data"
                    )
            else:
                logging.info(f"No yfinance data timestamp for {ticker}, fetching fresh data")
        except StockModel.DoesNotExist:
            logging.info(f"Stock {ticker} not in database, fetching from yfinance")

        stock_data = fetch_stock_data(ticker)
        return stock_data
    except Exception as e:
        logging.error(f"Error in get_stock_by_ticker for {ticker}: {str(e)}")
        raise


def fetch_stock_with_ma(symbol, ma_period=50):
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="1y")['Close']
    ma = hist.rolling(window=ma_period).mean()
    return {
        "symbol": symbol,
        "latest_price": hist.iloc[-1],
        f"MA_{ma_period}": ma.iloc[-1]
    }


def get_stock_info(max, offset, filters=None, source=setup):
    max = int(max)
    offset = int(offset)

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

    tickers = list(source())
    stocks = []

    allowed_sectors = None
    if filters and filters.get('sectors'):
        fs_set = {str(s).strip().lower() for s in filters.get('sectors') if s}
        allowed_sectors = fs_set
        tickers = [
            t for t in tickers
            if hasattr(t, 'sectorKey') and str(getattr(t, 'sectorKey', '')).lower()
            in allowed_sectors
        ]

    allowed_industries = None
    if filters and filters.get('industries'):
        fi_set = {str(s).strip().lower() for s in filters.get('industries') if s}
        allowed_industries = fi_set
        tickers = [
            t for t in tickers
            if hasattr(t, 'industryKey')
            and str(getattr(t, 'industryKey', '')).lower() in allowed_industries
        ]

    for t in tickers[offset:offset+max]:
        stock_data = fetch_stock_data(t.symbol)
        stocks.append(stock_data)

    screeners_list = []
    if (
        filters
        and filters.get('price_52w_high')
        and filters.get('price_52w_high_value') is not None
    ):
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


def stock_model_to_stock(stock_model):
    """Convert a StockModel instance to a Stock object."""
    return Stock({
        'symbol': stock_model.symbol,
        'longName': stock_model.company_name,
        'shortName': stock_model.company_name,
        'displayName': stock_model.company_name,
        'currentPrice': float(stock_model.current_price) if stock_model.current_price else None,
        'open': float(stock_model.open_price) if stock_model.open_price else None,
        'previousClose': float(stock_model.previous_close) if stock_model.previous_close else None,
        'dayHigh': (
            float(stock_model.day_high) if stock_model.day_high else None
        ),
        'dayLow': (
            float(stock_model.day_low) if stock_model.day_low else None
        ),
        'fiftyDayAverage': (
            float(stock_model.fifty_day_average)
            if stock_model.fifty_day_average else None
        ),
        'fiftyTwoWeekHigh': (
            float(stock_model.fifty_two_week_high)
            if stock_model.fifty_two_week_high else None
        ),
        'fiftyTwoWeekLow': (
            float(stock_model.fifty_two_week_low)
            if stock_model.fifty_two_week_low else None
        ),
        'exchange': stock_model.exchange,
        'fullExchangeName': stock_model.full_exchange_name,
        'industry': stock_model.industry,
        'sector': stock_model.sector,
        'country': stock_model.country,
        'marketCap': stock_model.market_cap,
        'volume': stock_model.volume,
        'regularMarketVolume': stock_model.volume,
        'averageVolume': stock_model.average_volume,
        'averageDailyVolume3Month': stock_model.average_volume,
        'regularMarketChangePercent': (
            float(stock_model.regular_market_change_percent)
            if stock_model.regular_market_change_percent else None
        ),
    })


def save_stock_data_to_db(info):
    """Save or update stock data in the database with yfinance data."""
    from django.utils import timezone
    from decimal import Decimal
    
    symbol = info.get('symbol', '').upper()
    company_name = info.get('longName') or info.get('shortName') or symbol

    def to_decimal(value):
        if value is None:
            return None
        try:
            return Decimal(str(value))
        except Exception:
            return None

    def to_int(value):
        if value is None:
            return None
        try:
            return int(value)
        except Exception:
            return None

    stock_model, created = StockModel.objects.update_or_create(
        symbol=symbol,
        defaults={
            'company_name': company_name,
            'yfinance_data_updated_at': timezone.now(),
            'current_price': to_decimal(
                info.get('currentPrice') or info.get('regularMarketPrice')
            ),
            'open_price': to_decimal(
                info.get('open') or info.get('regularMarketOpen')
            ),
            'previous_close': to_decimal(
                info.get('previousClose')
                or info.get('regularMarketPreviousClose')
            ),
            'day_high': to_decimal(info.get('dayHigh') or info.get('regularMarketDayHigh')),
            'day_low': to_decimal(info.get('dayLow') or info.get('regularMarketDayLow')),
            'fifty_day_average': to_decimal(info.get('fiftyDayAverage')),
            'fifty_two_week_high': to_decimal(info.get('fiftyTwoWeekHigh')),
            'fifty_two_week_low': to_decimal(info.get('fiftyTwoWeekLow')),
            'exchange': info.get('exchange'),
            'full_exchange_name': info.get('fullExchangeName'),
            'industry': info.get('industry'),
            'sector': info.get('sector'),
            'country': info.get('country'),
            'market_cap': to_int(info.get('marketCap')),
            'volume': to_int(
                info.get('volume') or info.get('regularMarketVolume')
            ),
            'average_volume': to_int(
                info.get('averageVolume')
                or info.get('averageDailyVolume3Month')
                or info.get('avgDailyVolume3Month')
            ),
            'regular_market_change_percent': to_decimal(
                info.get('regularMarketChangePercent')
            ),
        }
    )

    action = "Created" if created else "Updated"
    logging.info(f"{action} stock data in database for {symbol}")
    return stock_model


def fetch_stock_data(ticker):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info or info.get('regularMarketPrice') is None:
            raise ValueError(f"Unable to fetch valid data for ticker: {ticker}")

        save_stock_data_to_db(info)

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
        # No 30 day average volume filter available in yfinance?
        # Using 3 month average volume instead for now.
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
