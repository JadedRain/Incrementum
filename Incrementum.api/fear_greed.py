from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_GET

from Incrementum.fear_greed_service import fetch_fear_greed_json


@require_GET
def get_fear_greed_index(request):
    try:
        try:
            data = fetch_fear_greed_json()
        except Exception as exc:
            return HttpResponse(str(exc), status=502)

        return JsonResponse(data, safe=False)
    except Exception:
        import traceback
        return HttpResponse(traceback.format_exc(), status=500)
