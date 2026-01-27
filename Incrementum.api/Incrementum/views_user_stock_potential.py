import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.models.user_stock_potential import UserStockPotential
from Incrementum.models.account import Account
from Incrementum.models.stock import StockModel
from Incrementum.models.stock_history import StockHistory

def get_user_from_request(request):
    return request.headers.get('X-User-Id')


def calculate_stock_price_difference(stock_symbol_obj, purchase_date, quantity):
    old_price_record = StockHistory.objects.filter(
        stock_symbol=stock_symbol_obj,
        day_and_time=purchase_date
    ).first()

    new_price_record = StockHistory.objects.filter(
        stock_symbol=stock_symbol_obj
    ).order_by('-day_and_time').first()

    if not old_price_record or not new_price_record:
        return None

    old_price = old_price_record.close_price
    new_price = new_price_record.close_price

    diff = (old_price - new_price) * quantity
    return diff


@csrf_exempt
@require_http_methods(["GET", "POST"])
def user_stock_potential_list_create(request):
    if request.method == "GET":
        return get_user_stock_potentials(request)
    elif request.method == "POST":
        return create_user_stock_potential(request)


@csrf_exempt
@require_http_methods(["GET"])
def get_user_stock_potentials(request):
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    try:
        account = Account.objects.get(api_key=api_key)
    except Account.DoesNotExist:
        return JsonResponse({"error": "Account not found"}, status=404)

    potentials = UserStockPotential.objects.filter(account=account)

    result = []
    for potential in potentials:
        purchase_date = (
            potential.purchase_date.isoformat()
            if hasattr(potential.purchase_date, 'isoformat')
            else str(potential.purchase_date)
        )
        diff = calculate_stock_price_difference(
            potential.stock_symbol,
            potential.purchase_date,
            potential.quantity
        )
        result.append({
            'id': potential.id,
            'account_id': potential.account.id,
            'stock_symbol': potential.stock_symbol.symbol,
            'company_name': potential.stock_symbol.company_name,
            'purchase_date': purchase_date,
            'quantity': str(potential.quantity),
            'purchase_price': str(potential.purchase_price),
            'difference': str(diff)
        })

    # Always return a valid JSON object, even if empty
    return JsonResponse({'potentials': result if result else []}, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def create_user_stock_potential(request):
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    try:
        account = Account.objects.get(api_key=api_key)
    except Account.DoesNotExist:
        return JsonResponse({"error": "Account not found"}, status=404)

    data = json.loads(request.body)

    stock_symbol = data.get('stock_symbol')
    purchase_date = data.get('purchase_date')
    quantity = data.get('quantity')
    purchase_price = data.get('purchase_price')

    if not all([stock_symbol, purchase_date, quantity, purchase_price]):
        return JsonResponse({
            "error": (
                "Missing required fields: stock_symbol, purchase_date, "
                "quantity, purchase_price"
            )
        }, status=400)

    try:
        stock = StockModel.objects.get(symbol=stock_symbol)
    except StockModel.DoesNotExist:
        return JsonResponse(
            {"error": f"Stock {stock_symbol} not found"},
            status=404
        )

    try:
        potential = UserStockPotential.objects.create(
            account=account,
            stock_symbol=stock,
            purchase_date=purchase_date,
            quantity=quantity,
            purchase_price=purchase_price
        )

        purchase_date = (
            potential.purchase_date.isoformat()
            if hasattr(potential.purchase_date, 'isoformat')
            else str(potential.purchase_date)
        )
        return JsonResponse({
            'id': potential.id,
            'account_id': potential.account.id,
            'stock_symbol': potential.stock_symbol.symbol,
            'company_name': potential.stock_symbol.company_name,
            'purchase_date': purchase_date,
            'quantity': str(potential.quantity),
            'purchase_price': str(potential.purchase_price)
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
