import json
from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .utils import get_unique_sectors, get_industries_2, get_unique_industries

@csrf_exempt
@require_http_methods(["GET"])
def get_industries(request):
    try:
        csv_path = Path(__file__).resolve().parent / 'data' / 'ticker_info.csv'
        industries = get_unique_industries(csv_path)
        return JsonResponse({'industries': industries})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

@csrf_exempt
@require_http_methods(["GET"])
def get_sectors(request):
    try:
        sectors = get_unique_sectors()
        return JsonResponse({'sectors': sectors})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

@csrf_exempt
@require_http_methods(["POST"])
def get_industries2(request):
    try:
        sectors_list = None
        try:
            body = json.loads(request.body.decode('utf-8') or '{}')
            sectors_body = body.get('sectors')
            if isinstance(sectors_body, list):
                sectors_list = [str(s).strip() for s in sectors_body if str(s).strip()]
        except Exception:
            sectors_list = None
        industries = get_industries_2(sectors_list)
        return JsonResponse({'industries': industries})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)