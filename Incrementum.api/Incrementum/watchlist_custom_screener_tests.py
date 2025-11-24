import json
from django.test import TestCase, Client
from django.urls import reverse
from .models_user import Account
from Incrementum.screener_service import ScreenerService
from Incrementum.watchlist_service import WatchlistService


class WatchlistCustomScreenerTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.account = Account.objects.create(
            name="Watchlist Test User",
            phone_number="1111111111",
            email="watchlisttest@example.com",
            password_hash="hashed",
            api_key="watchlisttestapikey"
        )
        self.headers = {'HTTP_X_USER_ID': self.account.api_key}

        self.screener_service = ScreenerService()
        self.watchlist_service = WatchlistService()

        self.custom_screener = self.screener_service.create_custom_screener(
            self.account.api_key,
            numeric_filters=[{"filter_name": "market_cap", "value": 1000000000}],
            categorical_filters=[{"filter_name": "sector", "value": "Technology"}]
        )

    def test_add_custom_screener_to_watchlist_service(self):
        result = self.watchlist_service.add_custom_screener(
            self.account.api_key,
            self.custom_screener.id
        )

        assert result is True

        screeners = self.watchlist_service.get_custom_screeners(self.account.api_key)
        assert len(screeners) == 1
        assert screeners[0]['id'] == self.custom_screener.id
        assert screeners[0]['type'] == 'custom'

    def test_add_custom_screener_to_watchlist_api(self):
        url = reverse('add_custom_screener_to_watchlist')
        data = {"custom_screener_id": self.custom_screener.id}

        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json',
            **self.headers
        )

        assert response.status_code == 200
        response_data = response.json()
        assert response_data['message'] == "Custom screener added to watchlist successfully"
        assert response_data['custom_screener_id'] == self.custom_screener.id

    def test_remove_custom_screener_from_watchlist_service(self):
        self.watchlist_service.add_custom_screener(
            self.account.api_key,
            self.custom_screener.id
        )

        result = self.watchlist_service.remove_custom_screener(
            self.account.api_key,
            self.custom_screener.id
        )

        assert result is True

        screeners = self.watchlist_service.get_custom_screeners(self.account.api_key)
        assert len(screeners) == 0

    def test_remove_custom_screener_from_watchlist_api(self):
        self.watchlist_service.add_custom_screener(
            self.account.api_key,
            self.custom_screener.id
        )

        url = reverse('remove_custom_screener_from_watchlist')
        data = {"custom_screener_id": self.custom_screener.id}

        response = self.client.delete(
            url,
            data=json.dumps(data),
            content_type='application/json',
            **self.headers
        )

        assert response.status_code == 200
        response_data = response.json()
        assert response_data['message'] == "Custom screener removed from watchlist successfully"

    def test_get_all_watchlist_screeners_api(self):
        self.watchlist_service.add_custom_screener(
            self.account.api_key,
            self.custom_screener.id
        )

        url = reverse('get_all_watchlist_screeners')
        response = self.client.get(url, **self.headers)

        assert response.status_code == 200
        response_data = response.json()
        assert 'prebuilt_screeners' in response_data
        assert 'custom_screeners' in response_data
        assert len(response_data['custom_screeners']) == 1

    def test_add_duplicate_custom_screener_to_watchlist(self):
        result1 = self.watchlist_service.add_custom_screener(
            self.account.api_key,
            self.custom_screener.id
        )

        result2 = self.watchlist_service.add_custom_screener(
            self.account.api_key,
            self.custom_screener.id
        )

        assert result1 is True
        assert result2 is True

        screeners = self.watchlist_service.get_custom_screeners(self.account.api_key)
        assert len(screeners) == 1

    def test_add_nonexistent_custom_screener_to_watchlist(self):
        result = self.watchlist_service.add_custom_screener(
            self.account.api_key,
            99999
        )

        assert result is False

    def test_add_other_users_custom_screener_to_watchlist(self):
        other_account = Account.objects.create(
            name="Other User",
            phone_number="2222222222",
            email="other@example.com",
            password_hash="hashed",
            api_key="othertestapikey"
        )

        other_screener = self.screener_service.create_custom_screener(
            other_account.api_key,
            numeric_filters=[{"filter_name": "pe_ratio", "value": 20}]
        )

        result = self.watchlist_service.add_custom_screener(
            self.account.api_key,
            other_screener.id
        )

        assert result is False

    def test_missing_auth_header_in_api(self):
        url = reverse('add_custom_screener_to_watchlist')
        data = {"custom_screener_id": self.custom_screener.id}

        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 400
        assert response.json()['error'] == "X-User-Id header required"
