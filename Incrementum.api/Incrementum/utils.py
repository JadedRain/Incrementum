import os
import traceback
from django.utils import timezone
from polygon import RESTClient
from Incrementum.models.stock import StockModel
from decimal import Decimal
from Incrementum.stock_history_service import StockHistoryService
from logging import Logger

logger = Logger("logs")


def fetch_new_stocks_from_polygon():
    api_key = os.environ.get('POLYGON_API_KEY')
    if not api_key or api_key.strip() == '':
        print('ERROR: POLYGON_API_KEY not set in environment')
        return []
    try:
        client = RESTClient(api_key)
        tickers = []

        for ticker in client.list_tickers(market='stocks', limit=1000):
            tickers.append({
                'symbol': ticker.ticker,
                'name': getattr(ticker, 'name', ticker.ticker),
            })

        print(f"Fetched {len(tickers)} tickers from Polygon")
        return tickers

    except Exception as e:
        print(f"ERROR fetching tickers from Polygon: {e}")
        traceback.print_exc()
        return []


def update_stocks_in_db_from_polygon(stock_data, status_dict=None):
    api_key = os.environ.get('POLYGON_API_KEY')
    if not api_key:
        print('ERROR: POLYGON_API_KEY not set, cannot fetch metadata')
        return 0

    if not stock_data:
        print('ERROR: No stock data provided')
        return 0

    print(f"Starting to fetch metadata for {len(stock_data)} stocks...")
    print("This will take a while...")

    if status_dict:
        status_dict['total'] = len(stock_data)
        status_dict['progress'] = 0

    client = RESTClient(api_key)
    saved_count = 0
    error_count = 0

    # Clear existing stocks
    deleted = StockModel.objects.all().delete()
    print(f"Cleared {deleted[0]} existing stocks from database")

    for idx, entry in enumerate(stock_data):
        ticker = entry.get('symbol')
        if not ticker:
            continue

        try:
            # Fetch detailed metadata from Polygon
            details = client.get_ticker_details(ticker)

            # Parse list_date
            list_date = None
            if hasattr(details, 'list_date') and details.list_date:
                try:
                    from datetime import datetime
                    list_date = datetime.strptime(
                        details.list_date, '%Y-%m-%d'
                    ).date()
                except (ValueError, TypeError):
                    pass

            # Fetch annual VX financials and extract basic EPS for last fiscal year
            eps_value = None
            try:
                last_year = timezone.now().year - 1

                def _dp_value(dp):
                    if dp is None:
                        return None
                    return getattr(dp, 'value', dp)

                reports = client.vx.list_stock_financials(
                    ticker=ticker,
                    timeframe='annual',
                    limit=5,
                )
                target = None
                for rpt in reports:
                    fiscal_year = getattr(rpt, 'fiscal_year', None)
                    if fiscal_year is not None:
                        try:
                            if int(fiscal_year) == int(last_year):
                                target = rpt
                                break
                        except Exception:
                            pass
                    end_date_str = getattr(rpt, 'end_date', None)
                    if end_date_str:
                        end_dt = datetime.strptime(end_date_str[:10], '%Y-%m-%d').date()
                        if end_dt.year == last_year:
                            target = rpt
                            break

                if target is None:
                    target = next(
                        iter(
                            client.vx.list_stock_financials(
                                ticker=ticker,
                                timeframe='annual',
                                limit=1,
                            )
                        ),
                        None,
                    )

                if target is not None:
                    fin = getattr(target, 'financials', None)
                    income = getattr(fin, 'income_statement', None) if fin is not None else None
                    beps = None
                    if income is not None:
                        beps = _dp_value(
                            getattr(income, 'basic_earnings_per_share', None)
                        )
                    if beps is not None:
                        try:
                            eps_value = Decimal(str(round(float(beps), 4)))
                        except Exception:
                            eps_value = None
            except Exception:
                eps_value = None

            stock, created = StockModel.objects.update_or_create(
                symbol=ticker,
                defaults={
                    'company_name': getattr(details, 'name', ticker),
                    'description': getattr(details, 'description', None),
                    'market_cap': getattr(details, 'market_cap', None),
                    'primary_exchange': getattr(details, 'primary_exchange', None),
                    'type': getattr(details, 'type', None),
                    'currency_name': getattr(details, 'currency_name', None),
                    'cik': getattr(details, 'cik', None),
                    'composite_figi': getattr(details, 'composite_figi', None),
                    'share_class_figi': getattr(
                        details, 'share_class_figi', None
                    ),
                    'outstanding_shares': getattr(
                        details, 'weighted_shares_outstanding', None
                    ),
                    'eps': eps_value,
                    'homepage_url': getattr(details, 'homepage_url', None),
                    'total_employees': getattr(details, 'total_employees', None),
                    'list_date': list_date,
                    'locale': getattr(details, 'locale', None),
                    'sic_code': getattr(details, 'sic_code', None),
                    'sic_description': getattr(details, 'sic_description', None),
                    'updated_at': timezone.now()
                }
            )

            saved_count += 1

        except Exception as e:
            error_count += 1
            if error_count <= 10:
                print(f"Error fetching {ticker}: {e}")

        if (idx + 1) % 100 == 0:
            progress_msg = (
                f"Processed {idx + 1}/{len(stock_data)} stocks... "
                f"(Saved: {saved_count}, Errors: {error_count})"
            )
            print(progress_msg)
            if status_dict:
                status_dict['progress'] = idx + 1
                status_dict['saved'] = saved_count
                status_dict['errors'] = error_count
    print(f"COMPLETE: Saved {saved_count} stocks to database")
    print(f"Errors: {error_count}")

    if status_dict:
        status_dict['progress'] = len(stock_data)
        status_dict['saved'] = saved_count
        status_dict['errors'] = error_count

    return saved_count


def fetch_and_update_symbols():
    data = fetch_new_stocks_from_polygon()
    if not data:
        print("ERROR: No data fetched from Polygon")
        return 0

    saved = update_stocks_in_db_from_polygon(data)
    return saved


def calculate_percent_change(ticker: str, mode: str = 'day'):
    shs = StockHistoryService()
    now = timezone.now()

    if mode == 'day':
        df, _ = shs.history(ticker, period='2d', interval='1d')
        if df is None or len(df) < 2:
            return None, now
        old_time, new_time = df.index[-2], df.index[-1]
        old, new = df['Close'].iloc[-2], df['Close'].iloc[-1]
        logger.error(f"[PercentChange] DAY: old=({old_time}, {old}), new=({new_time}, {new})")

    elif mode == 'hour':
        df, _ = shs.history(ticker, period='2d', interval='1h')
        if df is None or len(df) < 2:
            return None, now
        old_time, new_time = df.index[-2], df.index[-1]
        old, new = df['Close'].iloc[-2], df['Close'].iloc[-1]
        logger.error(f"[PercentChange] HOUR: old=({old_time}, {old}), new=({new_time}, {new})")
    else:
        raise ValueError("mode must be 'day' or 'hour'")
    if old == 0 or old is None or new is None:
        return None, now
    percent_change = (new - old) / old
    return percent_change, now
