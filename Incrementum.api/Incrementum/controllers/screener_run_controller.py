import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.DTOs.ifilterdata import FilterData
from Screeners.stock_getter import StockGetter

REQUIRED_KEYS = {"operator", "operand", "filter_type", "value"}


@csrf_exempt
@require_http_methods(["POST"])
def run_screener(request):
    try:
        try:
            payload = json.loads(request.body or b"[]")
        except json.JSONDecodeError:
            return JsonResponse(
                    {"error": "Invalid JSON"},
                    status=400
            )

        if not isinstance(payload, list):
            return JsonResponse(
                {"error": "Body must be a JSON array of filter objects"},
                status=400
            )

        filters = []
        for index, item in enumerate(payload):
            if not isinstance(item, dict):
                return JsonResponse(
                    {"error": f"Item at index {index} is not an object"},
                    status=400
                )
            missing = REQUIRED_KEYS - item.keys()
            if missing:
                return JsonResponse(
                    {"error": f"Item {index} missing keys: {sorted(missing)}"},
                    status=400
                )
            operator = item.get("operator")
            operand = item.get("operand")
            filter_type = item.get("filter_type")
            value = item.get("value")

            if filter_type not in ("numeric", "categoric"):
                return JsonResponse(
                    {"error": f"Invalid filter_type '{filter_type}' at index {index}"},
                    status=400
                )

            if operator == 'btwn':
                if not (isinstance(value, (list, tuple)) and len(value) == 2):
                    return JsonResponse(
                        {"error": f"Between operator requires a 2-element value at index {index}"},
                        status=400,
                    )
            filters.append(FilterData(operator, operand, filter_type, value))
        sort_value = request.META.get("HTTP_SORTVALUE")
        sort_bool = request.META.get("HTTP_SORTBOOL") == "true"
        if request.META.get("HTTP_SORTBOOL") is None:
            sort_bool = None

        getter = StockGetter()
        if sort_value is None or sort_bool is None:
            print("No sorting headers provided — skipping sort.")
            getter.addSort(sort_value, sort_bool)
        else:
            print(f"Sorting by {sort_value}, ascending: {sort_bool}")
        stocks = getter.get_stocks(filters)
        stocks_dict = [s.to_dict() if hasattr(s, 'to_dict') else s for s in stocks]
        # Return in the format expected by frontend: { stocks: { quotes: [...] } }
        return JsonResponse(
            {"stocks": {"quotes": stocks_dict}, "count": len(stocks_dict)},
            status=200
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
