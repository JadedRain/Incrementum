from .stock_history_service import StockHistoryService
from .stocks_class import Stock
import logging
from django.db import connection
from Screeners.moving_average_52 import fifty_two_high
from Screeners.numeric_screeners import NumericScreeners


def setup():
    from Incrementum.models import StockModel
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
    """Get stock by ticker using ORM models or API fallback"""
    try:
        from Incrementum.models import StockModel
        from .services.stock_api_client import stock_api_client
        
        # Try to get stock directly from ORM (API or database)
        try:
            stock = StockModel.objects.get(symbol__iexact=ticker)
            logging.info(f"Found {ticker} via ORM")
            # Convert to Stock class format if needed
            if hasattr(stock, 'to_dict'):
                return Stock(stock.to_dict())
            return stock
        except StockModel.DoesNotExist:
            logging.warning(f"Stock {ticker} not found via ORM, trying API")
            
            # Fallback to API
            api_response = stock_api_client.get_stock_by_symbol(ticker)
            if api_response and 'symbol' in api_response:
                logging.info(f"Found {ticker} via API")
                # Create Stock object with latest_price mapped to currentPrice
                stock_data = api_response.copy()
                stock_data['currentPrice'] = stock_data.get('latest_price')
                return Stock(stock_data)
            else:
                raise ValueError(f"Stock {ticker} not found in ORM or API")
            
    except Exception as e:
        logging.error(f"Error getting stock {ticker}: {str(e)}")
        raise ValueError(f"Failed to get stock {ticker}: {str(e)}")


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
    """Ensure stock exists in database using ORM models"""
    try:
        from Incrementum.models import StockModel
        
        # Try to get existing stock
        try:
            stock = StockModel.objects.get(symbol=symbol)
            logging.info(f"Stock {symbol} already exists in database")
            return stock
        except StockModel.DoesNotExist:
            # Create new stock if it doesn't exist
            try:
                stock = StockModel.objects.create(
                    symbol=symbol,
                    company_name=company_name
                )
                logging.info(f"Created new stock {symbol} in database")
                return stock
            except Exception as create_error:
                # Handle case where API models don't support create
                logging.warning(f"Could not create stock {symbol} via ORM: {create_error}")
                return None
    except Exception as e:
        logging.error(f"Error ensuring stock {symbol} exists: {str(e)}")
        return None


def fetch_stock_data(ticker):
    """Fetch stock data using ORM models (external API or database)"""
    try:
        from Incrementum.models import StockModel
        # Get stock from ORM - either external API or database
        stock = StockModel.objects.get(symbol=ticker)
        logging.info(f"Retrieved {ticker} via ORM")
        
        # Convert to Stock class format if it's a model instance
        if hasattr(stock, 'to_dict'):
            return Stock(stock.to_dict())
        return stock
        
    except Exception as e:
        logging.error(f"Error fetching stock data for {ticker}: {str(e)}")
        raise ValueError(f"Failed to fetch data for ticker {ticker}: {str(e)}")


def screen_stocks_by_percent_change(percent_change_filter, percent_change_value, max_results=100):
    """Screen stocks by percent change using ORM models only"""
    logging.warning("Percent change screening not implemented without yfinance")
    return []


def screen_stocks_by_average_volume(average_volume_filter, average_volume_value, max_results=100):
    """Screen stocks by average volume using ORM models only"""
    logging.warning("Average volume screening not implemented without yfinance")
    return []


def screen_stocks_by_current_share_price(price_filter, price_value, max_results=100):
    """Screen stocks by current share price using ORM models only"""
    logging.warning("Current share price screening not implemented without yfinance")
    return []
