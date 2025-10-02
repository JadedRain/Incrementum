import os
import django
from django.conf import settings
from django.test.utils import get_runner

def pytest_configure():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api_project.settings')
    django.setup()