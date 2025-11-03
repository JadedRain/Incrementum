import pytest
pytestmark = pytest.mark.django_db
from django.test import TestCase
from Incrementum.models import CustomScreener
from .models_user import Account
from Incrementum.screener_service import ScreenerService


class ScreenerServiceTest(TestCase):
    def setUp(self):
        self.account = Account.objects.create(
            name="Test User",
            phone_number="1234567890",
            email="test@example.com",
            password_hash="hashed",
            api_key="testapikey"
        )
        self.service = ScreenerService()

    def test_create_custom_screener_with_numeric_filters(self):
        numeric_filters = [
            {'filter_name': 'market_cap', 'numeric_value': 1000000000},
            {'filter_name': 'pe_ratio', 'numeric_value': 15}
        ]
        
        screener = self.service.create_custom_screener(
            self.account.api_key,
            numeric_filters=numeric_filters
        )
        
        assert screener is not None
        assert screener.account == self.account
        
        filters = screener.filters or []
        numeric_items = [f for f in filters if f.get('filter_type') == 'numeric']
        assert len(numeric_items) == 2
    
        market_cap = next((f for f in numeric_items if f.get('operand') == 'market_cap'), None)
        assert market_cap is not None
        assert market_cap.get('value') == 1000000000
    
        pe_ratio = next((f for f in numeric_items if f.get('operand') == 'pe_ratio'), None)
        assert pe_ratio is not None
        assert pe_ratio.get('value') == 15

    def test_create_custom_screener_with_categorical_filters(self):
        categorical_filters = [
            {'filter_name': 'sector', 'category_value': 'Technology'},
            {'filter_name': 'country', 'category_value': 'USA'}
        ]
        
        screener = self.service.create_custom_screener(
            self.account.api_key,
            categorical_filters=categorical_filters
        )
        
        assert screener is not None
        
        filters = screener.filters or []
        categorical_items = [f for f in filters if f.get('filter_type') == 'categorical']
        assert len(categorical_items) == 2

        sector = next((f for f in categorical_items if f.get('operand') == 'sector'), None)
        assert sector is not None
        assert sector.get('value') == 'Technology'

        country = next((f for f in categorical_items if f.get('operand') == 'country'), None)
        assert country is not None
        assert country.get('value') == 'USA'

    def test_create_custom_screener_with_mixed_filters(self):
        numeric_filters = [
            {'filter_name': 'market_cap', 'numeric_value': 5000000000}
        ]
        categorical_filters = [
            {'filter_name': 'sector', 'category_value': 'Healthcare'}
        ]
        
        screener = self.service.create_custom_screener(
            self.account.api_key,
            numeric_filters=numeric_filters,
            categorical_filters=categorical_filters
        )
        
        assert screener is not None
        
        filters = screener.filters or []
        assert len([f for f in filters if f.get('filter_type') == 'numeric']) == 1
        assert len([f for f in filters if f.get('filter_type') == 'categorical']) == 1

    def test_get_custom_screener(self):
        numeric_filters = [{'filter_name': 'revenue', 'numeric_value': 100000000}]
        categorical_filters = [{'filter_name': 'exchange', 'category_value': 'NASDAQ'}]
        
        created_screener = self.service.create_custom_screener(
            self.account.api_key,
            numeric_filters=numeric_filters,
            categorical_filters=categorical_filters
        )
        
        retrieved_screener = self.service.get_custom_screener(
            self.account.api_key,
            created_screener.id
        )
        
        assert retrieved_screener is not None
        assert retrieved_screener['id'] == created_screener.id
        assert len(retrieved_screener['numeric_filters']) == 1
        assert len(retrieved_screener['categorical_filters']) == 1
        # service returns FilterData-like dicts with 'operand' and 'value'
        assert retrieved_screener['numeric_filters'][0]['operand'] == 'revenue'
        assert retrieved_screener['numeric_filters'][0]['value'] == 100000000
        assert retrieved_screener['categorical_filters'][0]['operand'] == 'exchange'
        assert retrieved_screener['categorical_filters'][0]['value'] == 'NASDAQ'

    def test_get_user_custom_screeners(self):
        self.service.create_custom_screener(
            self.account.api_key,
            numeric_filters=[{'filter_name': 'market_cap', 'numeric_value': 1000000}]
        )
        self.service.create_custom_screener(
            self.account.api_key,
            categorical_filters=[{'filter_name': 'sector', 'category_value': 'Finance'}]
        )
        
        screeners = self.service.get_user_custom_screeners(self.account.api_key)
        
        assert len(screeners) == 2
        assert all('id' in screener for screener in screeners)
        assert all('created_at' in screener for screener in screeners)
        assert all('filter_count' in screener for screener in screeners)

    def test_delete_custom_screener(self):
        screener = self.service.create_custom_screener(
            self.account.api_key,
            numeric_filters=[{'filter_name': 'debt_ratio', 'numeric_value': 30}]
        )
        
        assert CustomScreener.objects.filter(id=screener.id).exists()
        
        result = self.service.delete_custom_screener(self.account.api_key, screener.id)
        
        assert result == True
        assert not CustomScreener.objects.filter(id=screener.id).exists()

    def test_update_custom_screener(self):
        original_filters = [{'filter_name': 'old_filter', 'numeric_value': 100}]
        screener = self.service.create_custom_screener(
            self.account.api_key,
            numeric_filters=original_filters
        )
        
        new_numeric_filters = [{'filter_name': 'new_numeric', 'numeric_value': 200}]
        new_categorical_filters = [{'filter_name': 'new_categorical', 'category_value': 'NewValue'}]
        
        updated_screener = self.service.update_custom_screener(
            self.account.api_key,
            screener.id,
            numeric_filters=new_numeric_filters,
            categorical_filters=new_categorical_filters
        )
        
        assert updated_screener is not None

        # verify old filter was removed and new filters present in JSON
        filters = updated_screener.filters or []
        assert not any(f.get('operand') == 'old_filter' for f in filters)
        assert any(f.get('operand') == 'new_numeric' and f.get('value') == 200 for f in filters)
        assert any(f.get('operand') == 'new_categorical' and f.get('value') == 'NewValue' for f in filters)

    def test_create_screener_nonexistent_user(self):
        screener = self.service.create_custom_screener(
            "nonexistent_api_key",
            numeric_filters=[{'filter_name': 'test', 'numeric_value': 1}]
        )
        
        assert screener is None