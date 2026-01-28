from ..stock_history_service import StockHistoryService
import json
import logging
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.models.stock import StockModel
from Incrementum.serializers import StockSerializer
from Incrementum.get_stock_info import get_stock_info, search_stocks, get_stock_by_ticker


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
def get_stocks_info(request):
    try:
        max_val = int(request.GET.get('max', 10))
        offset = int(request.GET.get('offset', 0))
    except (TypeError, ValueError):
        return JsonResponse({'error': 'Invalid max or offset'}, status=400)
    filters = None
    filters_param = request.GET.get('filters')
    if filters_param:
        try:
            filters = json.loads(filters_param)
        except Exception:
            return JsonResponse({'error': 'Invalid filters JSON'}, status=400)
    try:
        stocks = get_stock_info(max_val, offset, filters)
        # If result is a list of Stock objects, convert to dicts
        stocks_out = [s.to_dict() if hasattr(s, 'to_dict') else s for s in stocks]
        return JsonResponse({'length': len(stocks_out), 'stocks': stocks_out}, status=200)
    except ValueError as ve:
        return JsonResponse({'error': str(ve)}, status=500)


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
        }, status=200)
    except StockModel.DoesNotExist:
        return JsonResponse(
            {'error': f'Stock with ticker {ticker} not found'},
            status=404
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
        dates = [ts.strftime("%Y-%m-%dT%H:%M:%S") for ts in history.index.to_pydatetime()]
    except Exception:
        # fallback if index not datetime
        dates = [str(i) for i in history.index]

    close = [None if (pd.isna(v)) else float(v) for v in history["Close"].tolist()]
    open_ = (
        [None if (pd.isna(v)) else float(v) for v in history["Open"].tolist()]
        if "Open" in history else [None] * len(dates)
    )
    high = (
        [None if (pd.isna(v)) else float(v) for v in history["High"].tolist()]
        if "High" in history else [None] * len(dates)
    )
    low = (
        [None if (pd.isna(v)) else float(v) for v in history["Low"].tolist()]
        if "Low" in history else [None] * len(dates)
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
def get_all_stocks_with_info(request):
    limit = int(request.GET.get('limit', 100))
    offset = int(request.GET.get('offset', 0))

    limit = min(limit, 1000)

    total_count = StockModel.objects.count()
    stocks = StockModel.objects.all()[offset:offset+limit]
    stocks_data = [stock.to_dict() for stock in stocks]

    return JsonResponse({
        'total': total_count,
        'count': len(stocks_data),
        'limit': limit,
        'offset': offset,
        'stocks': stocks_data
    }, status=200)


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
@require_http_methods(["GET"])
def hello_world(request):
    return JsonResponse({"message": "Hello, world!"})


@csrf_exempt
@require_http_methods(["GET"])
def get_stock_eps(request, ticker):
    try:
        stock = StockModel.objects.get(symbol__iexact=ticker)
        eps_val = float(stock.eps) if stock.eps is not None else None
        return JsonResponse({'symbol': stock.symbol, 'eps': eps_val}, status=200)
    except StockModel.DoesNotExist:
        return JsonResponse({'error': f'Stock with ticker {ticker} not found'}, status=404)
