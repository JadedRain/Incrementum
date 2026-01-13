from Incrementum.utils import fetch_new_stocks_from_finnhub
from Incrementum.utils import update_stocks_in_db_from_finnhub
from Incrementum.models.stock import StockModel

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
import os
import csv
import json


@csrf_exempt
@require_http_methods(["GET"])
def fetch_update_and_list_stocks(request):
    data = fetch_new_stocks_from_finnhub()
    update_stocks_in_db_from_finnhub(data)
    all_stocks = [s.to_dict() for s in StockModel.objects.all()]
    return JsonResponse({'stocks': all_stocks})


@csrf_exempt
@require_http_methods(["GET"])
def fetch_finnhub_stocks_view(request):
    data = fetch_new_stocks_from_finnhub()
    return JsonResponse({'length': len(data), 'finnhub_stocks': data})


@csrf_exempt
@require_http_methods(["GET"])
def get_fear_greed_from_csv(request):
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    csv_path = os.path.join(repo_root, 'fear_greed.csv')

    if not os.path.exists(csv_path):
        return JsonResponse({'error': 'fear_greed.csv not found'}, status=404)

    try:
        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = []
            for row in reader:
                parsed = {}
                for k, v in row.items():
                    if v is None:
                        parsed[k] = None
                        continue
                    v = v.strip()
                    try:
                        parsed_v = json.loads(v)
                    except Exception:
                        parsed_v = v
                    parsed[k] = parsed_v
                rows.append(parsed)

        return JsonResponse(rows, safe=False)
    except Exception as exc:
        return JsonResponse({'error': str(exc)}, status=500)
