import csv
import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


fetch_status = {
    'running': False,
    'progress': 0,
    'total': 0,
    'saved': 0,
    'errors': 0,
    'started_at': None
}


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
