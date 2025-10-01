from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from hello.screener_service import ScreenerService

screener_service = ScreenerService()

def get_user_from_request(request):
    return request.headers.get('X-User-Id')

@csrf_exempt
@require_http_methods(["POST"])
def create_custom_screener(request):
    try:
        api_key = get_user_from_request(request)
        if not api_key:
            return JsonResponse({"error": "X-User-Id header required"}, status=400)
        
        data = json.loads(request.body)
        numeric_filters = data.get('numeric_filters', [])
        categorical_filters = data.get('categorical_filters', [])
        
        screener = screener_service.create_custom_screener(
            api_key,
            numeric_filters=numeric_filters,
            categorical_filters=categorical_filters
        )
        
        if screener is None:
            return JsonResponse({"error": "User not found"}, status=404)
        
        return JsonResponse({
            "id": screener.id,
            "created_at": screener.created_at.isoformat(),
            "message": "Custom screener created successfully"
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt  
@require_http_methods(["GET"])
def get_custom_screener(request, screener_id):
    try:
        api_key = get_user_from_request(request)
        if not api_key:
            return JsonResponse({"error": "X-User-Id header required"}, status=400)
        
        screener = screener_service.get_custom_screener(api_key, screener_id)
        
        if screener is None:
            return JsonResponse({"error": "Screener not found"}, status=404)
        
        return JsonResponse(screener, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def list_custom_screeners(request):
    try:
        api_key = get_user_from_request(request)
        if not api_key:
            return JsonResponse({"error": "X-User-Id header required"}, status=400)
        
        screeners = screener_service.get_user_custom_screeners(api_key)
        
        return JsonResponse({
            "screeners": screeners,
            "count": len(screeners)
        }, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])  
def update_custom_screener(request, screener_id):
    try:
        api_key = get_user_from_request(request)
        if not api_key:
            return JsonResponse({"error": "X-User-Id header required"}, status=400)
        
        data = json.loads(request.body)
        numeric_filters = data.get('numeric_filters', [])
        categorical_filters = data.get('categorical_filters', [])
        
        screener = screener_service.update_custom_screener(
            api_key,
            screener_id,
            numeric_filters=numeric_filters,
            categorical_filters=categorical_filters
        )
        
        if screener is None:
            return JsonResponse({"error": "Screener not found or access denied"}, status=404)
        
        return JsonResponse({
            "id": screener.id,
            "updated_at": screener.updated_at.isoformat() if hasattr(screener, 'updated_at') else None,
            "message": "Custom screener updated successfully"
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_custom_screener(request, screener_id):
    try:
        api_key = get_user_from_request(request)
        if not api_key:
            return JsonResponse({"error": "X-User-Id header required"}, status=400)
        
        success = screener_service.delete_custom_screener(api_key, screener_id)
        
        if not success:
            return JsonResponse({"error": "Screener not found or access denied"}, status=404)
        
        return JsonResponse({"message": "Custom screener deleted successfully"}, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)