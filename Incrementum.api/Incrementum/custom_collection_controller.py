import logging
import yfinance as yf
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .services.custom_collection_service import CustomCollectionService
from .graph_utils import generate_overlay_graph
from django.views.decorators.http import require_GET
from Incrementum.models_user import Account


@csrf_exempt
@require_http_methods(["GET", "POST", "DELETE", "PUT"])
def custom_collection(request):
    try:
        import json
        api_key = request.META.get('HTTP_X_USER_ID')
        if not api_key:
            return JsonResponse({'error': 'User id header X-User-Id required'}, status=401)
        custom_collection = CustomCollectionService()

        collection_name = None
        if request.method == "GET":
            collection_name = request.GET.get('collection') or request.META.get('HTTP_X_COLLECTION_NAME')
        else:
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
            desc = data.get('desc')
            symbols_field = data.get('symbols') or request.META.get('HTTP_X_SYMBOLS')
            symbols = None
            if symbols_field:
                if isinstance(symbols_field, str):
                    symbols = [s.strip().upper() for s in symbols_field.split(',') if s.strip()]
                else:
                    symbols = list(symbols_field)
            
            try:
                added_count = custom_collection.add_stocks(api_key, collection_name, symbols, desc)
            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)
 
            return JsonResponse({'status': 'ok', 'added_count': added_count}, status=200)

        elif request.method == "DELETE":
            symbols_field = data.get('symbols') or request.META.get('HTTP_X_SYMBOLS')
            symbols = None
            if symbols_field:
                if isinstance(symbols_field, str):
                    symbols = [s.strip().upper() for s in symbols_field.split(',') if s.strip()]
                else:
                    symbols = list(symbols_field)

            if not symbols:
                custom_collection.delete_collection(api_key, collection_name)

            try:
                if symbols:
                    custom_collection.remove_stocks(symbols, api_key, collection_name)
            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)
            return JsonResponse({'status': 'ok'}, status=200)

        elif request.method == "PUT":
            # Update collection name and/or description
            new_name = data.get('new_name')
            new_desc = data.get('new_desc')
            
            if not new_name and new_desc is None:
                return JsonResponse({'error': 'new_name or new_desc is required for update'}, status=400)
            
            try:
                updated_collection = custom_collection.update_collection(
                    api_key, 
                    collection_name, 
                    new_name=new_name,
                    new_desc=new_desc
                )
                return JsonResponse({
                    'status': 'ok',
                    'collection': {
                        'id': updated_collection.id,
                        'name': updated_collection.collection_name,
                        'desc': updated_collection.c_desc
                    }
                }, status=200)
            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)

    except Exception as e:
        logging.exception("Unhandled error in custom_collection endpoint")
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
        try:
            tokens = [t.get('symbol') for t in custom_collection.get_stocks(api_key, collection_name)]
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)
        img_bytes, error = generate_overlay_graph(tokens)

        if error:
            return JsonResponse({"error": error}, status=500)

        return HttpResponse(img_bytes, content_type="image/png")
    except Exception as e:
        logging.exception("Unhandled error in custom_collection_overlay_graph")
        return JsonResponse({"error": f"Error generating overlay graph: {str(e)}"}, status=500)


@csrf_exempt
@require_GET
def custom_collections_list(request):
    try:
        api_key = request.META.get('HTTP_X_USER_ID')
        if not api_key:
            return JsonResponse({'error': 'User id header X-User-Id required'}, status=401)
        custom_collection = CustomCollectionService()
        collections = custom_collection.get_all_collections(api_key)
        return JsonResponse({'collections': collections})
    except Exception as e:
        logging.exception('Unhandled error listing custom collections')
        return JsonResponse({'error': str(e)}, status=500)