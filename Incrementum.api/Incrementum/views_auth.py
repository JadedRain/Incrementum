import json
import uuid
import bcrypt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models_user import Account
from .keycloak_service import verify_keycloak_token, get_token_with_password
from Incrementum.services.custom_collection_service import CustomCollectionService


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

        existing = Account.objects.filter(email=email).first()
        if existing:
            return JsonResponse({'error': 'Email already exists'}, status=400)

        if Account.objects.filter(phone_number=phone_number).exists():
            return JsonResponse({'error': 'Phone number already exists'}, status=400)

        # Create user in database only
        password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        api_key = str(uuid.uuid4())
        account = Account.objects.create(
            name=name,
            phone_number=phone_number,
            email=email,
            password_hash=password_hash,
            api_key=api_key,
            keycloak_id=None  # Legacy users have no Keycloak ID
        )
        serv = CustomCollectionService()
        serv._get_or_create_collection_for_account(
            collection_name="Default Collection",
            account=account,
            desc="Automatically created default collection",
            symbols=[])
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

        if account.keycloak_id and not account.password_hash:
            return JsonResponse({'error': 'Please use Keycloak login'}, status=401)

        if account.password_hash and bcrypt.checkpw(
            password.encode(), account.password_hash.encode()
        ):
            return JsonResponse({'api_key': account.api_key})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def sync_keycloak_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = data.get('token')

        if not token:
            return JsonResponse({'error': 'Token required'}, status=400)

        # Verify token and get user info
        token_info = verify_keycloak_token(token)
        if not token_info:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        email = token_info.get('email')
        keycloak_id = token_info.get('sub')
        preferred_username = token_info.get('preferred_username', email)

        if not email or not keycloak_id:
            return JsonResponse({'error': 'Invalid token data'}, status=400)

        # Check if user already exists by keycloak_id
        account = Account.objects.filter(keycloak_id=keycloak_id).first()

        if account:
            return JsonResponse({'api_key': account.api_key, 'user_id': account.id})

        # Check if user exists by email (legacy user converting to Keycloak)
        account = Account.objects.filter(email=email).first()
        if account:
            # Link existing account to Keycloak
            account.keycloak_id = keycloak_id
            account.save()
            return JsonResponse({'api_key': account.api_key, 'user_id': account.id})

        # Create new account for Keycloak user
        name = token_info.get('name', preferred_username)

        api_key = str(uuid.uuid4())
        account = Account.objects.create(
            name=name or email.split('@')[0],
            phone_number=f"kc_{keycloak_id[:10]}",  # Unique placeholder for Keycloak users
            email=email,
            password_hash='',  # No password hash for Keycloak-only users
            api_key=api_key,
            keycloak_id=keycloak_id
        )

        return JsonResponse({'api_key': account.api_key, 'user_id': account.id})

    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def keycloak_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)

        access_token = get_token_with_password(username, password)

        if access_token:
            return JsonResponse({'access_token': access_token})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def account_info(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        api_key = data.get('api_key')
        if not api_key:
            return JsonResponse({'error': 'API key required'}, status=400)
        try:
            account = Account.objects.get(api_key=api_key)
        except Account.DoesNotExist:
            return JsonResponse({'error': 'Invalid API key'}, status=401)
        return JsonResponse({
            'name': account.name,
            'email': account.email,
            'phone_number': account.phone_number,
            'is_keycloak_user': bool(account.keycloak_id)
        })
    return JsonResponse({'error': 'Invalid method'}, status=405)
