import json
import logging
import yfinance as yf
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Stock
from .serializers import StockSerializer
from .get_stock_info import get_stock_info, search_stocks, get_stock_by_ticker, generate_stock_graph


class StocksController:
    @csrf_exempt
    @require_http_methods(["GET", "POST"])
    def stock_list_create(request):
        try:
            if request.method == "GET":
                stocks = Stock.objects.all()
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
    def search_stocks(request, query, page):
        try:
            # Set up logging
            logging.basicConfig(
                level=logging.INFO,
                format="%(asctime)s - %(levelname)s - %(message)s"
            )
            
            results = search_stocks(query, page)
            logging.info(f"results: {results}")
            return JsonResponse(results)
            
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
                except Exception as e:
                    return JsonResponse({
                        'error': 'Invalid filters JSON', 
                        'details': str(e)
                    }, status=400)

            try:
                stocks = get_stock_info(max_val, offset, filters=filters)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)

            return JsonResponse({'stocks': [s.to_dict() for s in stocks]})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    @csrf_exempt
    @require_http_methods(["GET"])
    def get_stock_info(request, ticker):
        try:
            try:
                stock_data = get_stock_by_ticker(ticker)
                return JsonResponse(stock_data.to_dict(), status=200)
            except AttributeError:
                return JsonResponse({'error': 'Page Not Found'}, status=404)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    @csrf_exempt
    @require_http_methods(["GET"])
    def get_stock_graph(request, ticker):
        try:
            period = request.GET.get("period", "1y")
            interval = request.GET.get("interval", "1d")

            stock = yf.Ticker(ticker)

            try:
                history = stock.history(period=period, interval=interval)
            except Exception as e:
                return JsonResponse({
                    "error": f"Invalid period '{period}' or interval '{interval}'"
                }, status=400)

            if history.empty:
                return JsonResponse({
                    "error": f"No data found for {ticker} with period={period} and interval={interval}"
                }, status=404)

            png_bytes = generate_stock_graph(history, ticker, f"{period}, {interval}")
            return HttpResponse(png_bytes, content_type="image/png")
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    @staticmethod
    @csrf_exempt
    @require_http_methods(["GET"])
    def hello_world(request):
        return JsonResponse({"message": "Hello, world!"})