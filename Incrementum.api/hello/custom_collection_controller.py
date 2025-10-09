import logging
import yfinance as yf
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .custom_collection_service import CustomCollectionService
from .get_stock_info import generate_stock_graph
from .graph_utils import generate_overlay_graph


class CustomCollectionController:
    @csrf_exempt
    @require_http_methods(["GET", "POST", "DELETE"])
    def custom_collection(request):
        try:
            custom_collection = CustomCollectionService()
            
            if request.method == "GET":
                return JsonResponse({'tokens': custom_collection.get_stocks()})
            
            elif request.method == "POST":
                import json
                try:
                    data = json.loads(request.body)
                except json.JSONDecodeError:
                    return JsonResponse({'error': 'Invalid JSON'}, status=400)
                
                token = data.get('token')
                if not token:
                    return JsonResponse({'error': 'Token is required'}, status=400)
                
                custom_collection.add_stock(token)
                return JsonResponse({'tokens': custom_collection.get_stocks()})
            
            elif request.method == "DELETE":
                import json
                try:
                    data = json.loads(request.body)
                except json.JSONDecodeError:
                    return JsonResponse({'error': 'Invalid JSON'}, status=400)
                
                token = data.get('token')
                if not token:
                    return JsonResponse({'error': 'Token is required'}, status=400)
                
                custom_collection.remove_stock(token)
                return JsonResponse({'tokens': custom_collection.get_stocks()})
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    @csrf_exempt
    @require_http_methods(["GET"])
    def custom_collection_aggregate(request):
        try:
            custom_collection = CustomCollectionService()
            data = custom_collection.aggregate_data()
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    @csrf_exempt
    @require_http_methods(["GET"])
    def custom_collection_aggregate_graph(request):
        try:
            custom_collection = CustomCollectionService()
            tokens = custom_collection.get_stocks()
            logger = logging.getLogger("django")
            
            if not tokens:
                logger.error("No stocks in collection")
                return HttpResponse("No stocks in collection", status=404)
            
            ticker = tokens[0]
            stock = yf.Ticker(ticker)
            history = stock.history(period="1y")
            
            if history is None or history.empty:
                logger.error(f"No history for ticker {ticker}")
                return HttpResponse(f"No history for ticker {ticker}", status=500)
            
            img_bytes = generate_stock_graph(history, ticker, "1y")
            return HttpResponse(img_bytes, content_type="image/png")
            
        except Exception as e:
            logger = logging.getLogger("django")
            logger.exception("Error generating aggregate graph")
            return HttpResponse(f"Error generating graph: {str(e)}", status=500)
    
    @staticmethod
    @csrf_exempt
    @require_http_methods(["GET"])
    def custom_collection_overlay_graph(request):
        try:
            custom_collection = CustomCollectionService()
            tokens = custom_collection.get_stocks()
            img_bytes, error = generate_overlay_graph(tokens)
            
            if error:
                return HttpResponse(error, status=500)
            
            return HttpResponse(img_bytes, content_type="image/png")
            
        except Exception as e:
            return HttpResponse(f"Error generating overlay graph: {str(e)}", status=500)