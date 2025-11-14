from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.models import CategoricalFilter, NumericFilter


@csrf_exempt
@require_http_methods(["GET"])
def get_categorical_filter_types(request):
    try:
        filters = CategoricalFilter.objects.all().values_list('name', flat=True)
        return JsonResponse({
            'categorical_filters': list(filters)
        }, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_numeric_filter_types(request):
    try:
        filters = NumericFilter.objects.all().values_list('name', flat=True)
        return JsonResponse({
            'numeric_filters': list(filters)
        }, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
