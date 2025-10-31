from hello.utils import fetch_new_stocks_from_finnhub, update_stocks_in_db_from_finnhub
from hello.models import StockModel

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse

@csrf_exempt
@require_http_methods(["GET"])
def fetch_update_and_list_stocks(request):
	data = fetch_new_stocks_from_finnhub()
	update_stocks_in_db_from_finnhub(data)
	all_stocks = [s.to_dict() for s in StockModel.objects.all()]
	return JsonResponse({'stocks': all_stocks})


from django.http import JsonResponse
from hello.utils import fetch_new_stocks_from_finnhub

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET"])
def fetch_finnhub_stocks_view(request):
	data = fetch_new_stocks_from_finnhub()
	return JsonResponse({'length': len(data), 'finnhub_stocks': data})
