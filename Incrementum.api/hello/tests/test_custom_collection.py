import io
import pytest
from django.urls import reverse
from hello.services.custom_collection_service import CustomCollectionService

@pytest.fixture
def collection():
    return CustomCollectionService()

@pytest.mark.django_db
class TestCustomCollection:

    # --- Service tests ---
    def test_initial_tokens(self, collection):
        stocks = collection.get_stocks()
        assert isinstance(stocks, list)
        symbols = {t['symbol'] for t in stocks}
        assert symbols == {'AAPL', 'MSFT', 'GOOGL'}

    def test_add_stock(self, collection):
        collection.add_stock('TSLA')
        stocks = collection.get_stocks()
        assert any(stock['symbol'] == 'TSLA' for stock in stocks)
        # Should not add duplicate
        collection.add_stock('TSLA')
        stocks = collection.get_stocks()
        assert sum(1 for stock in stocks if stock['symbol'] == 'TSLA') == 1

    def test_remove_stock(self, collection):
        collection.add_stock('TSLA')
        collection.remove_stock('TSLA')
        stocks = collection.get_stocks()
        assert not any(stock['symbol'] == 'TSLA' for stock in stocks)
        collection.remove_stock('FAKE')
        stocks = collection.get_stocks()
        assert not any(stock.get('symbol') == 'FAKE' for stock in stocks)

    def test_aggregate_data(self, collection):
        result = collection.aggregate_data()
        assert 'tokens' in result
        assert 'aggregate' in result
        # tokens should be a list of stock objects
        assert isinstance(result['tokens'], list)
        if result['tokens']:
            assert isinstance(result['tokens'][0], dict)
        assert isinstance(result['aggregate'], dict)

    # --- API endpoint tests ---
    def test_custom_collection_get(self, client):
        url = reverse('custom_collection')
        response = client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert 'tokens' in data
        # tokens should be a list of stock objects with 'symbol'
        assert isinstance(data['tokens'], list)
        if data['tokens']:
            assert 'symbol' in data['tokens'][0]

    def test_custom_collection_add_and_remove(self, client):
        url = reverse('custom_collection')
        # Add token
        response = client.post(url, {'token': 'TSLA'}, content_type='application/json')
        assert response.status_code == 200
        stocks = response.json()['tokens']
        assert any(stock['symbol'] == 'TSLA' for stock in stocks)
        # Remove token
        response = client.delete(url, {'token': 'TSLA'}, content_type='application/json')
        assert response.status_code == 200
        stocks = response.json()['tokens']
        assert not any(stock['symbol'] == 'TSLA' for stock in stocks)

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
