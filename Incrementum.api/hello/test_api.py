import pytest
from django.urls import reverse
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

def test_hello_world(api_client):
    url = reverse('hello_world')
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data['message'] == 'Hello, world!'

def test_get_stock_info(api_client):
    url = reverse('get_stock_info')
    response = api_client.get(url, {'max': 1, 'offset': 0})
    assert response.status_code == 200
    assert 'stocks' in response.data
