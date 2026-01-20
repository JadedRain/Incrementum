from Incrementum.utils import fetch_new_stocks_from_polygon
from Incrementum.utils import update_stocks_in_db_from_polygon
from Incrementum.models.stock import StockModel
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
import threading
import time
import os
import csv
import json


@csrf_exempt
@require_http_methods(["GET"])
def fetch_update_and_list_stocks(request):
    data = fetch_new_stocks_from_polygon()
    update_stocks_in_db_from_polygon(data)
    all_stocks = [s.to_dict() for s in StockModel.objects.all()]
    return JsonResponse({'stocks': all_stocks})


@csrf_exempt
@require_http_methods(["GET"])
def fetch_polygon_stocks_view(request):
    data = fetch_new_stocks_from_polygon()
    return JsonResponse({'length': len(data), 'polygon_stocks': data})


fetch_status = {
    'running': False,
    'progress': 0,
    'total': 0,
    'saved': 0,
    'errors': 0,
    'started_at': None
}


def run_fetch_in_background():
    try:
        fetch_status['running'] = True
        fetch_status['started_at'] = time.time()

        # Fetch ticker list
        data = fetch_new_stocks_from_polygon()
        if not data:
            print("ERROR: No data fetched from Polygon")
            return

        saved_count = update_stocks_in_db_from_polygon(
            data, fetch_status
        )
        fetch_status['saved'] = saved_count

    except Exception as e:
        print(f"Background fetch error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        fetch_status['running'] = False


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
        # Start background thread
        thread = threading.Thread(target=run_fetch_in_background, daemon=False)
        thread.start()

        return JsonResponse({
            'success': True,
            'message': (
                'Fetch started in background. '
                'Use GET to check progress.'
            ),
        }, status=200)

    except Exception as e:
        print(f"\nERROR in fetch_and_update_database: {e}")
        import traceback
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
