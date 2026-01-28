from Incrementum.models.stock import StockModel
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.screener_service import ScreenerService
from Incrementum.screener import Screener
from Incrementum.DTOs.ifilterdata import FilterData
import json
import logging

screener_service = ScreenerService()


def get_user_from_request(request):
    return request.headers.get('X-User-Id')


@csrf_exempt
@require_http_methods(["GET", "POST"])
def custom_screener_list_create(request):
    if request.method == "GET":
        return list_custom_screeners(request)
    elif request.method == "POST":
        return create_custom_screener(request)


@csrf_exempt
@require_http_methods(["POST"])
def create_custom_screener(request):
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    name = data.get('screener_name') or data.get('name', 'Untitled Screener')
    print(f"DEBUG: Received data: {data}")
    print(f"DEBUG: Extracted name: {name}")
    numeric_filters = data.get('numeric_filters', [])
    categorical_filters = data.get('categorical_filters', [])
    if len(categorical_filters) == 0:
        logging.error("insufficient filters applied")
        return JsonResponse(
            {"error": "you need at least one categorical filter"},
            status=400
        )
    screener = screener_service.create_custom_screener(
        api_key,
        name=name,
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


@csrf_exempt
@require_http_methods(["GET"])
def get_custom_screener(request, screener_id):
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    screener = screener_service.get_custom_screener(api_key, screener_id)

    if screener is None:
        return JsonResponse({"error": "Screener not found"}, status=404)

    return JsonResponse(screener, status=200)


@csrf_exempt
@require_http_methods(["GET"])
def list_custom_screeners(request):
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    screeners = screener_service.get_user_custom_screeners(api_key)

    return JsonResponse({
        "screeners": screeners,
        "count": len(screeners)
    }, status=200)


@csrf_exempt
@require_http_methods(["PUT"])
def update_custom_screener(request, screener_id):
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

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

    updated_at = screener.updated_at.isoformat() if hasattr(screener, "updated_at") else None
    return JsonResponse({
        "id": screener.id,
        "updated_at": updated_at,
        "message": "Custom screener updated successfully"
    }, status=200)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_custom_screener(request, screener_id):
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    success = screener_service.delete_custom_screener(api_key, screener_id)

    if not success:
        return JsonResponse({"error": "Screener not found or access denied"}, status=404)

    return JsonResponse({"message": "Custom screener deleted successfully"}, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def run_database_screener(request):
    """
    Run screener using database queries with the new Screener class.
    Accepts a list of FilterData objects and returns matching stocks from the database.
    """
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if isinstance(payload, list):
        filters_payload = payload
        sort_by = None
        sort_order = 'asc'
    elif isinstance(payload, dict):
        filters_payload = payload.get('filters', [])
        sort_by = payload.get('sort_by')
        sort_order = payload.get('sort_order', 'asc')
    else:
        return JsonResponse({"error": "Body must be a JSON array or object"}, status=400)

    filters = []
    for index, item in enumerate(filters_payload):
        if not isinstance(item, dict):
            return JsonResponse(
                {"error": f"Item at index {index} is not an object"},
                status=400
            )

        required_keys = {"operator", "operand", "filter_type"}
        missing = required_keys - item.keys()
        if missing:
            return JsonResponse(
                {"error": f"Item {index} missing keys: {sorted(missing)}"},
                status=400
            )

        operator = item.get("operator")
        operand = item.get("operand")
        filter_type = item.get("filter_type")
        value = item.get("value")

        filters.append(FilterData(operator, operand, filter_type, value))

    screener = Screener()
    stocks = screener.query(filters, sort_by=sort_by, sort_order=sort_order)

    stocks_dict = [stock.to_dict() for stock in stocks]

    return JsonResponse(
        {
            "stocks": stocks_dict,
            "count": len(stocks_dict)
        },
        status=200
    )


@csrf_exempt
@require_http_methods(["GET"])
def industry_autocomplete(request):
    query = request.GET.get('query', '').strip()

    if not query:
        return JsonResponse({"industries": []}, status=200)

    stocks = StockModel.objects.filter(
        Q(sic_description__icontains=query) &
        Q(sic_description__isnull=False)
    ).values('sic_description').distinct()[:20]

    industries = [stock['sic_description'] for stock in stocks if stock['sic_description']]

    return JsonResponse({"industries": industries}, status=200)
