import os
import django


def pytest_configure():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api_project.settings')
    django.setup()
