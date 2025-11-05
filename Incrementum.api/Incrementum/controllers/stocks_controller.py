import json
import logging
import pandas as pd
import yfinance as yf
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Stock
from .serializers import StockSerializer
from .get_stock_info import get_stock_info, search_stocks, get_stock_by_ticker
from Incrementum.models import StockModel

@csrf_exempt
@require_http_methods(["GET", "POST"])
def stock_list_create(request):
    try:
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
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def search_stocks_controller(request, query, page):
    try:
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s"
        )
        
        results = search_stocks(query, page)
        logging.info(f"results: {results}")
        return JsonResponse(results, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
@require_http_methods(["GET"])
def get_stocks_info(request):
    try:
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
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
@require_http_methods(["GET"])
def get_stock_info_controller(request, ticker):
    try:
        stock_data = get_stock_by_ticker(ticker)
        return JsonResponse(stock_data.to_dict(), status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_stock_graph(request, ticker):
    try:
        period = request.GET.get("period", "1y")
        interval = request.GET.get("interval", "1d")
        stock = yf.Ticker(ticker)
        history = stock.history(period=period, interval=interval)
        if history.empty:
            return JsonResponse({
                "error": f"No data found for {ticker} with period={period} and interval={interval}"
            }, status=404)
        try:
            dates = [ts.strftime("%Y-%m-%dT%H:%M:%S") for ts in history.index.to_pydatetime()]
        except Exception:
            # fallback if index not datetime
            dates = [str(i) for i in history.index]

        close = [
            None if (pd.isna(v)) else float(v)
            for v in history["Close"].tolist()
        ]

        graphdata = {
            "period": period,
            "interval": interval,
            "count": len(dates),
            "dates": dates,
            "close": close,
        }

        logging.info("Returning JSON for %s (%d points)", ticker, len(dates))
        return JsonResponse(graphdata, status=200)

    except Exception as e:
        logging.exception("Error in get_stock_graph for %s", ticker)
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def hello_world(request):
    return JsonResponse({"message": "Hello, world!"})