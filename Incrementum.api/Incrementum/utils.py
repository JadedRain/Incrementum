import os
from django.utils import timezone
from polygon import RESTClient
from Incrementum.models.stock import StockModel


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
        import traceback
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

            # Create or update stock in database using Django ORM
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
            if error_count <= 10:  # Only print first 10 errors
                print(f"Error fetching {ticker}: {e}")

        # Progress update every 100 stocks
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
    # Fetch ticker list
    data = fetch_new_stocks_from_polygon()
    if not data:
        print("ERROR: No data fetched from Polygon")
        return 0

    # Update database with full metadata
    saved = update_stocks_in_db_from_polygon(data)
    return saved
