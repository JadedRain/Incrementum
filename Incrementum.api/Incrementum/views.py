import csv
import json
import os
import threading
import time
import traceback
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.models.stock import StockModel


fetch_status = {
    'running': False,
    'progress': 0,
    'total': 0,
    'saved': 0,
    'errors': 0,
    'started_at': None
}

@csrf_exempt
@require_http_methods(["POST", "GET"])
def fetch_and_update_database(request):

    if request.method == "GET":
        # Return current status
        stock_count = StockModel.objects.count()
        return JsonResponse({
            'running': fetch_status['running'],
            'progress': fetch_status['progress'],
            'total': fetch_status['total'],
            'saved': fetch_status['saved'],
            'errors': fetch_status['errors'],
            'stocks_in_db': stock_count,
            'started_at': fetch_status['started_at']
        }, status=200)

    # POST - start the fetch
    if fetch_status['running']:
        return JsonResponse({
            'success': False,
            'error': 'Fetch already running',
            'progress': fetch_status['progress'],
            'total': fetch_status['total']
        }, status=400)

    try:

        return JsonResponse({
            'success': True,
            'message': (
                'Fetch started in background. '
                'Use GET to check progress.'
            ),
        }, status=200)

    except Exception as e:
        print(f"\nERROR in fetch_and_update_database: {e}")
        traceback.print_exc()

        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


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
