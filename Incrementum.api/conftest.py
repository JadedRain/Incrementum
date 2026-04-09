import os
import django
from pathlib import Path
from dotenv import load_dotenv
from django.core.management import call_command
from django.db import connection

# Load environment variables from .env file
env_path = Path(__file__).parent / 'Incrementum' / 'tests' / '.env'
if env_path.exists():
    load_dotenv(env_path)


def pytest_configure():
    os.environ['DJANGO_SETTINGS_MODULE'] = 'api_project.settings_test'
    django.setup()
    
    # Apply migrations to the test database
    try:
        call_command('migrate', verbosity=0)
    except Exception as e:
        print(f"Migration warning: {e}")
