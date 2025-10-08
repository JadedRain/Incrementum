from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from hello.watchlist_service import WatchlistService

watchlist_service = WatchlistService()

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
        
        return JsonResponse(all_screeners, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)