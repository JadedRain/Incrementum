import pytest
import json
from django.test import TestCase, Client
from django.urls import reverse
from .models_user import Account
from hello.models import CustomScreener


class ScreenerAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.account = Account.objects.create(
            name="API Test User",
            phone_number="9876543210",
            email="apitest@example.com",
            password_hash="hashed",
            api_key="apitestapikey"
        )
        self.headers = {'HTTP_X_USER_ID': self.account.api_key}

    def test_create_custom_screener_api(self):
        url = reverse('create_custom_screener')
        data = {
            "numeric_filters": [
                {"filter_name": "market_cap", "value": 1000000000},
                {"filter_name": "pe_ratio", "value": 15}
            ],
            "categorical_filters": [
                {"filter_name": "sector", "value": "Technology"}
            ]
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json',
            **self.headers
        )
        
        assert response.status_code == 201
        response_data = response.json()
        assert 'id' in response_data
        assert 'created_at' in response_data
        assert response_data['message'] == "Custom screener created successfully"

    def test_list_custom_screeners_api(self):
        create_url = reverse('create_custom_screener')
        data = {
            "numeric_filters": [{"filter_name": "revenue", "value": 500000000}]
        }
        
        self.client.post(
            create_url,
            data=json.dumps(data),
            content_type='application/json',
            **self.headers
        )
        
        list_url = reverse('list_custom_screeners')
        response = self.client.get(list_url, **self.headers)
        
        assert response.status_code == 200
        response_data = response.json()
        assert 'screeners' in response_data
        assert 'count' in response_data
        assert response_data['count'] == 1

    def test_get_custom_screener_api(self):
        create_url = reverse('create_custom_screener')
        data = {
            "categorical_filters": [{"filter_name": "exchange", "value": "NASDAQ"}]
        }
        
        create_response = self.client.post(
            create_url,
            data=json.dumps(data),
            content_type='application/json',
            **self.headers
        )
        
        screener_id = create_response.json()['id']
        
        get_url = reverse('get_custom_screener', args=[screener_id])
        response = self.client.get(get_url, **self.headers)
        
        assert response.status_code == 200
        response_data = response.json()
        assert response_data['id'] == screener_id
        assert len(response_data['categorical_filters']) == 1
        assert response_data['categorical_filters'][0]['filter_name'] == 'exchange'
        assert response_data['categorical_filters'][0]['value'] == 'NASDAQ'

    def test_update_custom_screener_api(self):
        create_url = reverse('create_custom_screener')
        data = {
            "numeric_filters": [{"filter_name": "old_filter", "value": 100}]
        }
        
        create_response = self.client.post(
            create_url,
            data=json.dumps(data),
            content_type='application/json',
            **self.headers
        )
        
        screener_id = create_response.json()['id']
        
        update_url = reverse('update_custom_screener', args=[screener_id])
        update_data = {
            "numeric_filters": [{"filter_name": "new_filter", "value": 200}],
            "categorical_filters": [{"filter_name": "sector", "value": "Finance"}]
        }
        
        response = self.client.put(
            update_url,
            data=json.dumps(update_data),
            content_type='application/json',
            **self.headers
        )
        
        assert response.status_code == 200
        response_data = response.json()
        assert response_data['message'] == "Custom screener updated successfully"

    def test_delete_custom_screener_api(self):
        create_url = reverse('create_custom_screener')
        data = {
            "numeric_filters": [{"filter_name": "to_delete", "value": 1}]
        }
        
        create_response = self.client.post(
            create_url,
            data=json.dumps(data),
            content_type='application/json',
            **self.headers
        )
        
        screener_id = create_response.json()['id']
        
        delete_url = reverse('delete_custom_screener', args=[screener_id])
        response = self.client.delete(delete_url, **self.headers)
        
        assert response.status_code == 200
        response_data = response.json()
        assert response_data['message'] == "Custom screener deleted successfully"
        
        assert not CustomScreener.objects.filter(id=screener_id).exists()

    def test_missing_auth_header(self):
        url = reverse('create_custom_screener')
        data = {"numeric_filters": []}
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        assert response.json()['error'] == "X-User-Id header required"

    def test_invalid_json(self):
        url = reverse('create_custom_screener')
        
        response = self.client.post(
            url,
            data="invalid json",
            content_type='application/json',
            **self.headers
        )
        
        assert response.status_code == 400
        assert response.json()['error'] == "Invalid JSON"