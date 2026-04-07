import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.models.user_stock_potential import UserStockPotential
from Incrementum.models.account import Account
from Incrementum.models.stock import StockModel
from Incrementum.models.stock_history import StockHistory
from Incrementum.models.custom_screener import CustomScreener


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


def format_potential(potential):
    """Format a UserStockPotential object to JSON"""
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
    return {
        'id': potential.id,
        'account_id': potential.account.id,
        'stock_symbol': potential.stock_symbol.symbol,
        'company_name': potential.stock_symbol.company_name,
        'purchase_date': purchase_date,
        'quantity': str(potential.quantity),
        'purchase_price': str(potential.purchase_price),
        'screener': potential.screener.id if potential.screener else None,
        'difference': str(diff)
    }


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

    result = [format_potential(potential) for potential in potentials]

    # Always return a valid JSON object, even if empty
    return JsonResponse({'potentials': result if result else []}, status=200)


@csrf_exempt
@require_http_methods(["GET"])
def get_user_stock_potentials_by_stock(request, stock_symbol):
    """Get all user stock potentials for a specific stock"""
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    try:
        account = Account.objects.get(api_key=api_key)
    except Account.DoesNotExist:
        return JsonResponse({"error": "Account not found"}, status=404)

    try:
        stock = StockModel.objects.get(symbol=stock_symbol)
    except StockModel.DoesNotExist:
        return JsonResponse({"error": f"Stock {stock_symbol} not found"}, status=404)

    potentials = UserStockPotential.objects.filter(
        account=account,
        stock_symbol=stock
    )

    result = [format_potential(potential) for potential in potentials]
    return JsonResponse({'potentials': result if result else []}, status=200)


@csrf_exempt
@require_http_methods(["GET"])
def get_user_stock_potentials_by_screener(request, screener_id):
    """Get all user stock potentials for a specific screener"""
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    try:
        account = Account.objects.get(api_key=api_key)
    except Account.DoesNotExist:
        return JsonResponse({"error": "Account not found"}, status=404)

    try:
        screener = CustomScreener.objects.get(id=screener_id)
    except CustomScreener.DoesNotExist:
        return JsonResponse({"error": f"Screener {screener_id} not found"}, status=404)

    potentials = UserStockPotential.objects.filter(
        account=account,
        screener=screener
    )

    result = [format_potential(potential) for potential in potentials]
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
    screener_id = data.get('screener')

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

    screener = None
    if screener_id:
        try:
            screener = CustomScreener.objects.get(id=screener_id)
        except CustomScreener.DoesNotExist:
            return JsonResponse(
                {"error": f"Screener {screener_id} not found"},
                status=404
            )

    try:
        potential = UserStockPotential.objects.create(
            account=account,
            stock_symbol=stock,
            purchase_date=purchase_date,
            quantity=quantity,
            purchase_price=purchase_price,
            screener=screener
        )

        return JsonResponse(format_potential(potential), status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def user_stock_potential_detail(request, potential_id):
    """Get, update, or delete a specific user stock potential"""
    api_key = get_user_from_request(request)
    if not api_key:
        return JsonResponse({"error": "X-User-Id header required"}, status=400)

    try:
        account = Account.objects.get(api_key=api_key)
    except Account.DoesNotExist:
        return JsonResponse({"error": "Account not found"}, status=404)

    try:
        potential = UserStockPotential.objects.get(id=potential_id, account=account)
    except UserStockPotential.DoesNotExist:
        return JsonResponse({"error": "User stock potential not found"}, status=404)

    if request.method == "GET":
        return JsonResponse(format_potential(potential), status=200)

    elif request.method == "PUT":
        data = json.loads(request.body)

        # Update fields if provided
        if 'stock_symbol' in data:
            try:
                potential.stock_symbol = StockModel.objects.get(symbol=data['stock_symbol'])
            except StockModel.DoesNotExist:
                return JsonResponse(
                    {"error": f"Stock {data['stock_symbol']} not found"},
                    status=404
                )

        if 'purchase_date' in data:
            potential.purchase_date = data['purchase_date']

        if 'quantity' in data:
            potential.quantity = data['quantity']

        if 'purchase_price' in data:
            potential.purchase_price = data['purchase_price']

        if 'screener' in data:
            if data['screener']:
                try:
                    potential.screener = CustomScreener.objects.get(id=data['screener'])
                except CustomScreener.DoesNotExist:
                    return JsonResponse(
                        {"error": f"Screener {data['screener']} not found"},
                        status=404
                    )
            else:
                potential.screener = None

        try:
            potential.save()
            return JsonResponse(format_potential(potential), status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "DELETE":
        potential.delete()
        return JsonResponse({"message": "User stock potential deleted"}, status=204)
