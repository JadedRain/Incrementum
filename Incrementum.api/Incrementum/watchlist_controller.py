import logging
import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.watchlist_service import WatchlistService
from django.http import JsonResponse
        
watchlist_service = WatchlistService()

@csrf_exempt
@require_http_methods(["POST"])
def add_to_watchlist(request):
    try:
        data = json.loads(request.body)
        symbol = data.get('symbol')
        user_id = request.headers.get('X-User-Id')
        if not symbol or not user_id:
            return JsonResponse({'error': 'Symbol and user_id are required'}, status=400)
        logging.info(f"[watchlist:add] user_id={user_id} symbol={symbol}")
        watchlist = watchlist_service.add(user_id, symbol)
        logging.info(f"[watchlist:add] size={len(watchlist)}")
        return JsonResponse({'watchlist': watchlist})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def remove_from_watchlist(request):
    try:
        data = json.loads(request.body)
        symbol = data.get('symbol')
        user_id = request.headers.get('X-User-Id')
        if not symbol or not user_id:
            return JsonResponse({'error': 'Symbol and user_id are required'}, status=400)
        logging.info(f"[watchlist:remove] user_id={user_id} symbol={symbol}")
        watchlist = watchlist_service.remove(user_id, symbol)
        logging.info(f"[watchlist:remove] size={len(watchlist)}")
        return JsonResponse({'watchlist': watchlist})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_watchlist(request):
    try:
        user_id = request.headers.get('X-User-Id')
        if not user_id:
            return JsonResponse({'error': 'user_id is required in headers'}, status=400)
        wl = watchlist_service.get(user_id)
        logging.info(f"[watchlist:get] user_id={user_id} size={len(wl)}")
        return JsonResponse({'watchlist': wl})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def search_stocks_watchlist(request):
    try:
        query = request.GET.get('query', '')
        user_id = request.headers.get('X-User-Id')
        if not query or not user_id:
            return JsonResponse({'error': 'Query and user_id are required'}, status=400)
        max_results = int(request.GET.get('max', 10))
        results = watchlist_service.search(user_id, query, max_results)
        return JsonResponse({'results': results})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_sorted_watchlist(request):
    try:
        user_id = request.headers.get('X-User-Id')
        if not user_id:
            return JsonResponse({'error': 'user_id is required in headers'}, status=400)
        sorted_wl = watchlist_service.get_sorted(user_id)
        logging.info(f"[watchlist:get_sorted] user_id={user_id} size={len(sorted_wl)}")
        return JsonResponse({'watchlist': sorted_wl})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_user_from_request(request):
    return request.headers.get('X-User-Id')

@csrf_exempt
@require_http_methods(["POST"])
def add_custom_screener_to_watchlist(request):
    try:
        api_key = get_user_from_request(request)
        if not api_key:
            return JsonResponse({"error": "X-User-Id header required"}, status=400)
        data = json.loads(request.body)
        custom_screener_id = data.get('custom_screener_id')
        if not custom_screener_id:
            return JsonResponse({"error": "custom_screener_id is required"}, status=400)
        success = watchlist_service.add_custom_screener(api_key, custom_screener_id)
        if success:
            return JsonResponse({
                "message": "Custom screener added to watchlist successfully",
                "custom_screener_id": custom_screener_id
            }, status=200)
        else:
            return JsonResponse({
                "error": "Failed to add custom screener to watchlist"
            }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
@csrf_exempt
@require_http_methods(["DELETE"])
def remove_custom_screener_from_watchlist(request):
    try:
        api_key = get_user_from_request(request)
        if not api_key:
            return JsonResponse({"error": "X-User-Id header required"}, status=400)
        data = json.loads(request.body)
        custom_screener_id = data.get('custom_screener_id')
        if not custom_screener_id:
            return JsonResponse({"error": "custom_screener_id is required"}, status=400)
        success = watchlist_service.remove_custom_screener(api_key, custom_screener_id)
        if success:
            return JsonResponse({
                "message": "Custom screener removed from watchlist successfully",
                "custom_screener_id": custom_screener_id
            }, status=200)
        else:
            return JsonResponse({
                "error": "Custom screener not found in watchlist"
            }, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
@csrf_exempt
@require_http_methods(["GET"])
def get_all_watchlist_screeners(request):
    try:
        api_key = get_user_from_request(request)
        if not api_key:
            return JsonResponse({"error": "X-User-Id header required"}, status=400)
        all_screeners = watchlist_service.get_all_screeners(api_key)
        return JsonResponse(all_screeners, safe=False, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)