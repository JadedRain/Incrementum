import pytest
import json
from django.test import Client
from Incrementum.models.stock import StockModel

pytestmark = pytest.mark.django_db


class TestValidateTickerSymbols:
    """Test the validate_ticker_symbols endpoint."""

    @pytest.fixture
    def client(self):
        return Client()

    @pytest.fixture
    def test_stocks(self):
        """Create test stocks in the database."""
        stocks = [
            StockModel(symbol='AAPL', company_name='Apple Inc.',
                       market_cap=3000000000000),
            StockModel(symbol='MSFT', company_name='Microsoft Corporation',
                       market_cap=2800000000000),
            StockModel(symbol='GOOGL', company_name='Alphabet Inc.',
                       market_cap=1700000000000),
        ]
        for stock in stocks:
            stock.save()
        return stocks

    def test_validate_all_valid_symbols(self, client, test_stocks):
        """Test validation with all valid symbols."""
        response = client.post(
            '/stocks/validate-tickers/',
            data=json.dumps({'symbols': ['AAPL', 'MSFT']}),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = json.loads(response.content)
        assert set(data['valid']) == {'AAPL', 'MSFT'}
        assert data['invalid'] == []

    def test_validate_all_invalid_symbols(self, client, test_stocks):
        """Test validation with all invalid symbols."""
        response = client.post(
            '/stocks/validate-tickers/',
            data=json.dumps({'symbols': ['INVALID', 'NOTFOUND']}),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = json.loads(response.content)
        assert data['valid'] == []
        assert set(data['invalid']) == {'INVALID', 'NOTFOUND'}

    def test_validate_mixed_symbols(self, client, test_stocks):
        """Test validation with mix of valid and invalid symbols."""
        response = client.post(
            '/stocks/validate-tickers/',
            data=json.dumps({'symbols': ['AAPL', 'INVALID', 'GOOGL']}),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = json.loads(response.content)
        assert set(data['valid']) == {'AAPL', 'GOOGL'}
        assert data['invalid'] == ['INVALID']

    def test_validate_case_insensitive(self, client, test_stocks):
        """Test that validation is case-insensitive."""
        response = client.post(
            '/stocks/validate-tickers/',
            data=json.dumps({'symbols': ['aapl', 'MsFt']}),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = json.loads(response.content)
        assert set(data['valid']) == {'AAPL', 'MSFT'}
        assert data['invalid'] == []

    def test_validate_empty_list(self, client, test_stocks):
        """Test validation with empty symbol list."""
        response = client.post(
            '/stocks/validate-tickers/',
            data=json.dumps({'symbols': []}),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = json.loads(response.content)
        assert data['valid'] == []
        assert data['invalid'] == []

    def test_validate_invalid_json(self, client):
        """Test validation with invalid JSON."""
        response = client.post(
            '/stocks/validate-tickers/',
            data='invalid json',
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.content)
        assert 'error' in data

    def test_validate_wrong_data_format(self, client):
        """Test validation with wrong data format (not a list)."""
        response = client.post(
            '/stocks/validate-tickers/',
            data=json.dumps({'symbols': 'AAPL'}),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = json.loads(response.content)
        assert 'error' in data
        assert 'must be a list' in data['error']
