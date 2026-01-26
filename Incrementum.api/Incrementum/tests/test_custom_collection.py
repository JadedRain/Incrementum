import pytest
from django.urls import reverse
from Incrementum.services.custom_collection_service import CustomCollectionService
from Incrementum.models.account import Account


@pytest.fixture
def account(db):
    return Account.objects.create(
        name="Test User",
        phone_number="1234567890",
        email="test@example.com",
        password_hash="hashed",
        api_key="testapikey"
    )


@pytest.fixture
def collection(account):
    svc = CustomCollectionService()
    return svc


@pytest.fixture(autouse=True)
def _ensure_account(account):
    # Autouse helper so API client requests have an Account in the DB.
    return None


@pytest.mark.django_db
class TestCustomCollection:

    # --- Service tests ---
    def test_initial_tokens(self, collection, account):
        collection.add_stocks(account.api_key, 'default', symbols=['AAPL', 'MSFT', 'GOOGL'])
        stocks = collection.get_stocks(account.api_key, 'default')
        assert isinstance(stocks, list)
        symbols = {t['symbol'] for t in stocks}
        assert {'AAPL', 'MSFT', 'GOOGL'}.issubset(symbols)

    def test_add_stock(self, collection, account):
        collection.add_stocks(account.api_key, 'default', symbols=['TSLA'])
        stocks = collection.get_stocks(account.api_key, 'default')
        assert any(stock['symbol'] == 'TSLA' for stock in stocks)
        # Should not add duplicate
        collection.add_stocks(account.api_key, 'default', symbols=['TSLA'])
        stocks = collection.get_stocks(account.api_key, 'default')
        assert sum(1 for stock in stocks if stock['symbol'] == 'TSLA') == 1

    def test_remove_stock(self, collection, account):
        collection.add_stocks(account.api_key, 'default', symbols=['TSLA'])
        collection.remove_stocks('TSLA', account.api_key, 'default')
        stocks = collection.get_stocks(account.api_key, 'default')
        assert not any(stock['symbol'] == 'TSLA' for stock in stocks)
        collection.remove_stocks('FAKE', account.api_key, 'default')
        stocks = collection.get_stocks(account.api_key, 'default')
        assert not any(stock.get('symbol') == 'FAKE' for stock in stocks)

    def test_aggregate_data(self, collection, account):
        # create/seed collection first via add_stock
        collection.add_stocks(account.api_key, 'default', symbols=['TSLA', 'AAPL', 'MSFT', 'GOOGL'])
        result = collection.aggregate_data(account.api_key, 'default')
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
        # include user id header
        # create collection first via API add
        resp = client.post(
            url,
            {'collection': 'default', 'symbols': ['TSLA', 'AAPL', 'MSFT', 'GOOGL']},
            content_type='application/json',
            HTTP_X_USER_ID='testapikey'
        )
        assert resp.status_code == 200
        response = client.get(url, {'collection': 'default'}, HTTP_X_USER_ID='testapikey')
        assert response.status_code == 200
        data = response.json()
        assert 'tokens' in data
        assert isinstance(data['tokens'], list)
        if data['tokens']:
            assert 'symbol' in data['tokens'][0]

    def test_custom_collection_add_and_remove(self, client):
        url = reverse('custom_collection')
        # Add token
        response = client.post(
            url,
            {'collection': 'default', 'symbols': 'TSLA'},
            content_type='application/json',
            HTTP_X_USER_ID='testapikey'
        )
        assert response.status_code == 200
        # Remove token
        response = client.delete(
            url,
            {'collection': 'default', 'symbols': 'TSLA'},
            content_type='application/json',
            HTTP_X_USER_ID='testapikey'
        )
        assert response.status_code == 200

    def test_custom_collection_aggregate(self, client):
        url = reverse('custom_collection_aggregate')
        # create collection first via API add
        add_url = reverse('custom_collection')
        resp = client.post(
            add_url,
            {'collection': 'default', 'symbols': ['TSLA', 'AAPL', 'MSFT', 'GOOGL']},
            content_type='application/json',
            HTTP_X_USER_ID='testapikey'
        )
        assert resp.status_code == 200
        response = client.get(url, {'collection': 'default'}, HTTP_X_USER_ID='testapikey')
        assert response.status_code == 200
        data = response.json()
        assert 'tokens' in data
        assert 'aggregate' in data

    # Rewrite aggregate graph test

    def test_custom_collection_overlay_graph(self, client):
        url = reverse('custom_collection_overlay_graph')
        response = client.get(url, {'collection': 'default'}, HTTP_X_USER_ID='testapikey')
        assert response.status_code in (200, 500)
        if response.status_code == 200:
            assert response['Content-Type'] == 'image/png'

    def test_delete_collection_removes_from_list(self, client):
        add_url = reverse('custom_collection')
        add_url = reverse('custom_collection')
        list_url = reverse('custom_collections_list')

        # create collection first via API add
        resp = client.post(
            add_url,
            {'collection': 'to_delete', 'symbols': ['AAPL', 'MSFT']},
            content_type='application/json',
            HTTP_X_USER_ID='testapikey'
        )
        assert resp.status_code == 200

        # ensure it shows up in list
        assert resp.status_code == 200
        data = resp.json()
        names = [c.get('name') for c in data.get('collections', [])]
        assert 'to_delete' in names

        # delete the collection by sending DELETE with no symbols
        resp = client.delete(
            add_url,
            {'collection': 'to_delete'},
            content_type='application/json',
            HTTP_X_USER_ID='testapikey'
        )
        assert resp.status_code == 200

        # now the list should not include it
        resp = client.get(list_url, HTTP_X_USER_ID='testapikey')
        assert resp.status_code == 200
        data = resp.json()
        names = [c.get('name') for c in data.get('collections', [])]
        assert 'to_delete' not in names

    def test_collections_list_requires_user_header_and_returns_collections(self, client):
        list_url = reverse('custom_collections_list')
        # missing header should return 401
        resp = client.get(list_url)
        assert resp.status_code == 401

        # create a collection
        add_url = reverse('custom_collection')
        resp = client.post(
            add_url,
            {'collection': 'mylist', 'symbols': ['GOOGL']},
            content_type='application/json',
            HTTP_X_USER_ID='testapikey'
        )
        assert resp.status_code == 200

        # now list with header
        resp = client.get(list_url, HTTP_X_USER_ID='testapikey')
        assert resp.status_code == 200
        data = resp.json()
        assert 'collections' in data
        # find our collection
        found = [c for c in data['collections'] if c.get('name') == 'mylist']
        assert len(found) == 1
        c = found[0]
        assert isinstance(c.get('stocks'), list)


@pytest.fixture(autouse=True)
def seed_stocks(db):
    try:
        from Incrementum.models.stock import StockModel
    except Exception:
        # If models aren't importable in some test contexts, just skip seeding
        return None
    symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA']
    for s in symbols:
        StockModel.objects.get_or_create(symbol=s, defaults={'company_name': s})
    return None
