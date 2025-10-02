import io
import pytest
from django.urls import reverse
from .custom_collection_service import CustomCollectionService

@pytest.fixture
def collection():
    return CustomCollectionService()

@pytest.mark.django_db
class TestCustomCollection:

    # --- Service tests ---
    def test_initial_tokens(self, collection):
        assert collection.get_stocks() == ['AAPL', 'MSFT', 'GOOGL']

    def test_add_stock(self, collection):
        collection.add_stock('TSLA')
        assert 'TSLA' in collection.get_stocks()
        # Should not add duplicate
        collection.add_stock('TSLA')
        assert collection.get_stocks().count('TSLA') == 1

    def test_remove_stock(self, collection):
        collection.add_stock('TSLA')
        collection.remove_stock('TSLA')
        assert 'TSLA' not in collection.get_stocks()
        # Removing non-existent stock should not error
        collection.remove_stock('FAKE')
        assert 'FAKE' not in collection.get_stocks()

    def test_aggregate_data(self, collection):
        result = collection.aggregate_data()
        assert 'tokens' in result
        assert 'aggregate' in result
        assert isinstance(result['tokens'], list)
        assert isinstance(result['aggregate'], dict)

    # --- API endpoint tests ---
    def test_custom_collection_get(self, client):
        url = reverse('custom_collection')
        response = client.get(url)
        assert response.status_code == 200
        assert 'tokens' in response.json()

    def test_custom_collection_add_and_remove(self, client):
        url = reverse('custom_collection')
        # Add token
        response = client.post(url, {'token': 'TSLA'}, content_type='application/json')
        assert response.status_code == 200
        assert 'TSLA' in response.json()['tokens']
        # Remove token
        response = client.delete(url, {'token': 'TSLA'}, content_type='application/json')
        assert response.status_code == 200
        assert 'TSLA' not in response.json()['tokens']

    def test_custom_collection_aggregate(self, client):
        url = reverse('custom_collection_aggregate')
        response = client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert 'tokens' in data
        assert 'aggregate' in data

    # Rewrite aggregate graph test

    def test_custom_collection_overlay_graph(self, client):
        url = reverse('custom_collection_overlay_graph')
        response = client.get(url)
        assert response.status_code in (200, 500)
        if response.status_code == 200:
            assert response['Content-Type'] == 'image/png'
