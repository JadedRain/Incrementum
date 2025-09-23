from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
import bcrypt
from .models_user import User

@csrf_exempt
def signup(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return JsonResponse({"error": "Missing username or password"}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "User already exists"}, status=409)
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    api_key = str(uuid.uuid4())
    user = User.objects.create(username=username, password_hash=password_hash, api_key=api_key)
    return JsonResponse({"api_key": user.api_key})

@csrf_exempt
def signin(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return JsonResponse({"error": "Missing username or password"}, status=400)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "Invalid username or password"}, status=401)
    if bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return JsonResponse({"api_key": user.api_key})
    else:
        return JsonResponse({"error": "Invalid username or password"}, status=401)
