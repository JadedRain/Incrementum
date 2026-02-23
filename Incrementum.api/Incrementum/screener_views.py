from Incrementum.models.stock import StockModel
from django.utils import timezone
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.screener_service import ScreenerService
from Incrementum.screener import Screener
from Incrementum.DTOs.ifilterdata import FilterData
import json
import logging
from datetime import timedelta
from .yrhilo import (
    fifty_two_week_high_dict,
    fifty_two_week_low_dict,
    current_price_dict,
    day_percent_change,
    PERCENT_CHANGE_CACHE_TTL_MINUTES,
)
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
    Supports pagination with page and per_page parameters.
    Query parameters override body parameters.
    """
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if isinstance(payload, list):
        filters_payload = payload
        sort_by = None
        sort_order = 'asc'
        page = 1
        per_page = 12
    elif isinstance(payload, dict):
        filters_payload = payload.get('filters', [])
        sort_by = payload.get('sort_by')
        sort_order = payload.get('sort_order', 'asc')
        page = payload.get('page', 1)
        per_page = payload.get('per_page', 12)
    else:
        return JsonResponse({"error": "Body must be a JSON array or object"}, status=400)

    # Query parameters override body parameters
    if 'sort_by' in request.GET:
        sort_by = request.GET.get('sort_by')
    if 'sort_order' in request.GET:
        sort_order = request.GET.get('sort_order', 'asc')
    if 'page' in request.GET:
        page = request.GET.get('page', 1)
    if 'page_size' in request.GET:
        per_page = request.GET.get('page_size', 25)

    try:
        page = max(1, int(page))
        per_page = max(1, min(500, int(per_page)))  # Cap at 500 per page
    except (ValueError, TypeError):
        return JsonResponse({"error": "page and per_page must be integers"}, status=400)

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
    stocks, total_count = screener.query(
        filters,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=per_page,
    )

    total_pages = (total_count + per_page - 1) // per_page

    # Batch fetch all highs, lows, price, and percent change at once
    symbols = [stock.symbol for stock in stocks]
    logging.info(f"DEBUG: Fetching highs/lows/price/percent_change for {len(symbols)} symbols")
    highs = fifty_two_week_high_dict(stocks=symbols) if symbols else {}
    lows = fifty_two_week_low_dict(stocks=symbols) if symbols else {}
    prices = current_price_dict(stocks=symbols) if symbols else {}

    now = timezone.now()
    fresh_after = now - timedelta(minutes=PERCENT_CHANGE_CACHE_TTL_MINUTES)
    percent_changes = {}
    stale_or_missing_symbols = []

    for stock in stocks:
        stock_updated_at = stock.updated_at
        if stock_updated_at and timezone.is_naive(stock_updated_at):
            stock_updated_at = timezone.make_aware(
                stock_updated_at,
                timezone.get_current_timezone(),
            )

        if (
            stock.day_percent_change is not None
            and stock_updated_at is not None
            and stock_updated_at >= fresh_after
        ):
            percent_changes[stock.symbol] = float(stock.day_percent_change)
        else:
            stale_or_missing_symbols.append(stock.symbol)

    if stale_or_missing_symbols:
        percent_changes.update(
            day_percent_change(stocks=stale_or_missing_symbols)
        )

    for stock in stocks:
        stock.high52 = highs.get(stock.symbol)
        stock.low52 = lows.get(stock.symbol)
        stock.price = prices.get(stock.symbol)
        stock.dayPercentChange = percent_changes.get(stock.symbol)

    stocks_dict = [stock.to_dict() for stock in stocks]

    for i, stock in enumerate(stocks):
        stocks_dict[i]['high52'] = stock.high52
        stocks_dict[i]['low52'] = stock.low52
        stocks_dict[i]['price'] = stock.price
        stocks_dict[i]['dayPercentChange'] = stock.dayPercentChange

    return JsonResponse(
        {
            "stocks": stocks_dict,
            "count": len(stocks_dict),
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
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


@csrf_exempt
@require_http_methods(["POST"])
def validate_ticker_symbols(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    symbols = data.get("symbols", [])
    if not isinstance(symbols, list):
        return JsonResponse({"error": "symbols must be a list"}, status=400)

    # Normalize symbols to uppercase
    symbols = [s.upper() for s in symbols if isinstance(s, str)]

    # Check which symbols exist in the database
    existing_stocks = StockModel.objects.filter(symbol__in=symbols).values_list('symbol', flat=True)
    existing_set = set(existing_stocks)

    valid_symbols = [s for s in symbols if s in existing_set]
    invalid_symbols = [s for s in symbols if s not in existing_set]

    return JsonResponse({
        "valid": valid_symbols,
        "invalid": invalid_symbols
    }, status=200)
