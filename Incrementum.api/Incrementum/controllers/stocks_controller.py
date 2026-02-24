from ..stock_history_service import StockHistoryService
from ..yrhilo import (
    current_price_dict,
    fifty_two_week_high_dict,
    fifty_two_week_low_dict,
    day_percent_change
)
from django.db import connection
import json
import logging
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.models.stock import StockModel
from Incrementum.serializers import StockSerializer
from Incrementum.get_stock_info import search_stocks, get_stock_by_ticker
from ..services.stock_service import StockService
logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def stock_list_create(request):
    if request.method == "GET":
        stocks = StockModel.objects.all()
        serializer = StockSerializer(stocks, many=True)
        return JsonResponse({'stocks': serializer.data})

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        serializer = StockSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse({'errors': serializer.errors}, status=400)


@csrf_exempt
@require_http_methods(["GET"])
def search_stocks_controller(request, query, page):
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s"
    )

    results = search_stocks(query, page)
    logging.info(f"results: {results}")
    return JsonResponse(results, safe=False)


@csrf_exempt
@require_http_methods(["GET"])
def get_stock_info_controller(request, ticker):
    stock_data = get_stock_by_ticker(ticker)
    return JsonResponse(stock_data.to_dict(), status=200)


@csrf_exempt
@require_http_methods(["GET"])
def get_stock_metadata(request, ticker):
    try:
        stock = StockModel.objects.get(symbol__iexact=ticker)
        symbol = stock.symbol

        # Get financial data from stock_history using yrhilo functions
        current_prices = current_price_dict(stock=symbol)
        highs_52w = fifty_two_week_high_dict(stock=symbol)
        lows_52w = fifty_two_week_low_dict(stock=symbol)
        percent_changes = day_percent_change(stock=symbol)

        # Get open, high, low from most recent day
        query = """
            SELECT open_price, high, low
            FROM incrementum.stock_history
            WHERE stock_symbol = %s
            ORDER BY day_and_time DESC
            LIMIT 1
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [symbol])
            result = cursor.fetchone()

        current_price = current_prices.get(symbol)
        high_52w = highs_52w.get(symbol)
        low_52w = lows_52w.get(symbol)
        percent_change = percent_changes.get(symbol)

        # Convert from cents to dollars
        open_price = result[0] / 100 if result and result[0] else None
        day_high = result[1] / 100 if result and result[1] else None
        day_low = result[2] / 100 if result and result[2] else None
        current_price = current_price / 100 if current_price else None
        high_52w = high_52w / 100 if high_52w else None
        low_52w = low_52w / 100 if low_52w else None

        # Calculate previous close from current and percent change
        previous_close = None
        change = None
        if current_price and percent_change is not None:
            previous_close = current_price / (1 + percent_change / 100)
            change = current_price - previous_close

        return JsonResponse({
            'symbol': stock.symbol,
            'company_name': stock.company_name,
            'description': stock.description,
            'market_cap': stock.market_cap,
            'primary_exchange': stock.primary_exchange,
            'type': stock.type,
            'currency_name': stock.currency_name,
            'cik': stock.cik,
            'composite_figi': stock.composite_figi,
            'share_class_figi': stock.share_class_figi,
            'outstanding_shares': stock.outstanding_shares,
            'homepage_url': stock.homepage_url,
            'total_employees': stock.total_employees,
            'list_date': (
                stock.list_date.isoformat() if stock.list_date else None
            ),
            'locale': stock.locale,
            'sic_code': stock.sic_code,
            'sic_description': stock.sic_description,
            'updated_at': (
                stock.updated_at.isoformat() if stock.updated_at else None
            ),
            'eps': (float(stock.eps) if stock.eps is not None else None),
            # Financial data from stock_history
            'currentPrice': current_price,
            'open': open_price,
            'high': day_high,
            'low': day_low,
            'previousClose': previous_close,
            'change': change,
            'changePercent': percent_change,
            'high52Week': high_52w,
            'low52Week': low_52w,
        }, status=200)
    except StockModel.DoesNotExist:
        return JsonResponse(
            {'error': f'Stock with ticker {ticker} not found'},
            status=404
        )
    except Exception as e:
        logger.error(f"Error fetching metadata for {ticker}: {str(e)}")
        return JsonResponse(
            {'error': 'Error fetching stock data'},
            status=500
        )


@csrf_exempt
@require_http_methods(["GET"])
def get_stock_graph(request, ticker):
    period = request.GET.get("period", "1y")
    interval = request.GET.get("interval", "1d")
    history_service = StockHistoryService()
    history, metadata = history_service.history(ticker, period=period, interval=interval)
    if history is None or history.empty:
        return JsonResponse({
            "error": f"No data found for {ticker} with period={period} and interval={interval}"
        }, status=404)
    try:
        if 'day_and_time' in history.columns:
            date_series = pd.to_datetime(history['day_and_time'])
            dates = [ts.strftime("%Y-%m-%dT%H:%M:%S") for ts in date_series]
        else:
            dates = [ts.strftime("%Y-%m-%dT%H:%M:%S") for ts in history.index.to_pydatetime()]
    except Exception:
        dates = [str(i) for i in range(len(history))]

    # Convert from cents to dollars
    close = [None if (pd.isna(v)) else float(v) / 100 for v in history["close_price"].tolist()]
    open_ = (
        [None if (pd.isna(v)) else float(v) / 100 for v in history["open_price"].tolist()]
        if "open_price" in history.columns else [None] * len(dates)
    )
    high = (
        [None if (pd.isna(v)) else float(v) / 100 for v in history["high"].tolist()]
        if "high" in history.columns else [None] * len(dates)
    )
    low = (
        [None if (pd.isna(v)) else float(v) / 100 for v in history["low"].tolist()]
        if "low" in history.columns else [None] * len(dates)
    )

    graphdata = {
        "period": period,
        "interval": interval,
        "count": len(dates),
        "dates": dates,
        "close": close,
        "open": open_,
        "high": high,
        "low": low,
    }

    logging.info("Returning JSON for %s (%d points)", ticker, len(dates))
    return JsonResponse(graphdata, status=200)


@csrf_exempt
@require_http_methods(["GET"])
def get_database_stocks(request):
    limit = int(request.GET.get('limit', 100))
    offset = int(request.GET.get('offset', 0))

    limit = min(limit, 1000)

    total_count = StockModel.objects.count()
    stocks = StockModel.objects.all().order_by('symbol')[offset:offset+limit]
    stocks_data = [stock.to_dict() for stock in stocks]

    return JsonResponse({
        'total': total_count,
        'count': len(stocks_data),
        'limit': limit,
        'offset': offset,
        'stocks': stocks_data
    }, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def get_stocks_by_tickers(request):
    try:
        data = json.loads(request.body)
        tickers = data.get('tickers', [])
        if not isinstance(tickers, list) or not all(isinstance(t, str) for t in tickers):
            return JsonResponse({'error': 'tickers must be a list of strings'}, status=400)
        stocks = StockService.get_stocks_by_symbols(tickers)
        logger.info(f"Got {len(stocks)} stocks")
        serializer = StockSerializer(stocks, many=True)
        return JsonResponse({'stocks': serializer.data}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
