import os
import django
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / 'Incrementum' / 'tests' / '.env'
if env_path.exists():
    load_dotenv(env_path)


def pytest_configure():
    os.environ['DJANGO_SETTINGS_MODULE'] = 'api_project.settings_test'
    django.setup()
