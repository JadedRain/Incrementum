from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
import bcrypt   
from .models_user import Account

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        phone_number = data.get('phone_number')
        email = data.get('email')
        password = data.get('password')
        if not name or not phone_number or not email or not password:
            return JsonResponse({'error': 'All fields required'}, status=400)
        if Account.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        if Account.objects.filter(phone_number=phone_number).exists():
            return JsonResponse({'error': 'Phone number already exists'}, status=400)
        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        api_key = str(uuid.uuid4())
        account = Account.objects.create(
            name=name,
            phone_number=phone_number,
            email=email,
            password_hash=password_hash,
            api_key=api_key
        )
        return JsonResponse({'api_key': account.api_key})
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return JsonResponse({'error': 'Email and password required'}, status=400)
        try:
            account = Account.objects.get(email=email)
        except Account.DoesNotExist:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        if bcrypt.checkpw(password.encode(), account.password_hash.encode()):
            return JsonResponse({'api_key': account.api_key})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Invalid method'}, status=405)
