import os
import django


def pytest_configure():
    os.environ['DJANGO_SETTINGS_MODULE'] = 'api_project.settings_test'
    django.setup()
