import logging
import yfinance as yf
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .services.custom_collection_service import CustomCollectionService
from .graph_utils import generate_overlay_graph


@csrf_exempt
@require_http_methods(["GET", "POST", "DELETE"])
def custom_collection(request):
    try:
        import json
        # expect client to provide user id via X-User-Id header
        api_key = request.META.get('HTTP_X_USER_ID')
        if not api_key:
            return JsonResponse({'error': 'User id header X-User-Id required'}, status=401)
        custom_collection = CustomCollectionService()

        # Determine collection name: prefer explicit collection in body (POST/DELETE) or query param/header (GET)
        collection_name = None
        if request.method == "GET":
            collection_name = request.GET.get('collection') or request.META.get('HTTP_X_COLLECTION_NAME')
        else:
            # POST and DELETE: expect JSON body with 'collection'
            try:
                data = json.loads(request.body)
            except Exception:
                return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            collection_name = data.get('collection') or request.META.get('HTTP_X_COLLECTION_NAME')

        if not collection_name:
            return JsonResponse({'error': 'collection name is required (query param or JSON body key "collection" or header X-Collection-Name)'}, status=400)

        if request.method == "GET":
            try:
                tokens = custom_collection.get_stocks(api_key, collection_name)
            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)
            return JsonResponse({'tokens': tokens})

        elif request.method == "POST":
            token = data.get('token')
            if not token:
                return JsonResponse({'error': 'Token is required'}, status=400)
            # optional symbols list in body can seed the collection when created
            symbols_field = data.get('symbols') or request.META.get('HTTP_X_SYMBOLS')
            symbols = None
            if symbols_field:
                if isinstance(symbols_field, str):
                    symbols = [s.strip().upper() for s in symbols_field.split(',') if s.strip()]
                else:
                    symbols = list(symbols_field)

            try:
                custom_collection.add_stock(token, api_key, collection_name, symbols)
                tokens = custom_collection.get_stocks(api_key, collection_name)
            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)
            return JsonResponse({'tokens': tokens})

        elif request.method == "DELETE":
            token = data.get('token')
            if not token:
                return JsonResponse({'error': 'Token is required'}, status=400)

            try:
                custom_collection.remove_stock(token, api_key, collection_name)
                tokens = custom_collection.get_stocks(api_key, collection_name)
            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)
            return JsonResponse({'tokens': tokens})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def custom_collection_aggregate(request):
    try:
        api_key = request.META.get('HTTP_X_USER_ID')
        if not api_key:
            return JsonResponse({'error': 'User id header X-User-Id required'}, status=401)
        # collection name comes from query param or header
        collection_name = request.GET.get('collection') or request.META.get('HTTP_X_COLLECTION_NAME')
        if not collection_name:
            return JsonResponse({'error': 'collection name is required (query param "collection" or header X-Collection-Name)'}, status=400)
        custom_collection = CustomCollectionService()
        try:
            data = custom_collection.aggregate_data(api_key, collection_name)
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
@require_http_methods(["GET"])
def custom_collection_aggregate_graph(request):
    try:
        api_key = request.META.get('HTTP_X_USER_ID')
        if not api_key:
            return JsonResponse({'error': 'User id header X-User-Id required'}, status=401)
        collection_name = request.GET.get('collection') or request.META.get('HTTP_X_COLLECTION_NAME')
        if not collection_name:
            return JsonResponse({'error': 'collection name is required (query param "collection" or header X-Collection-Name)'}, status=400)
        custom_collection = CustomCollectionService()
        try:
            tokens = [t.get('symbol') for t in custom_collection.get_stocks(api_key, collection_name)]
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)
        logger = logging.getLogger("django")

        if not tokens:
            logger.error("No stocks in collection")
            return JsonResponse({"error": "No stocks in collection"}, status=404)

        ticker = tokens[0]
        stock = yf.Ticker(ticker)
        history = stock.history(period="1y")

        if history is None or history.empty:
            logger.error(f"No history for ticker {ticker}")
            return JsonResponse({"error": f"No history for ticker {ticker}"}, status=500)

    except Exception as e:
        logger = logging.getLogger("django")
        logger.exception("Error generating aggregate graph")
        return JsonResponse({"error": f"Error generating graph: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def custom_collection_overlay_graph(request):
    try:
        api_key = request.META.get('HTTP_X_USER_ID')
        if not api_key:
            return JsonResponse({'error': 'User id header X-User-Id required'}, status=401)
        collection_name = request.GET.get('collection') or request.META.get('HTTP_X_COLLECTION_NAME')
        if not collection_name:
            return JsonResponse({'error': 'collection name is required (query param "collection" or header X-Collection-Name)'}, status=400)
        custom_collection = CustomCollectionService()
        # tokens from service are stock dicts; extract symbols for plotting
        try:
            tokens = [t.get('symbol') for t in custom_collection.get_stocks(api_key, collection_name)]
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)
        img_bytes, error = generate_overlay_graph(tokens)

        if error:
            return JsonResponse({"error": error}, status=500)

        return HttpResponse(img_bytes, content_type="image/png")
    except Exception as e:
        return JsonResponse({"error": f"Error generating overlay graph: {str(e)}"}, status=500)