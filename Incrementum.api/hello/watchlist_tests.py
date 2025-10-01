import pytest
pytestmark = pytest.mark.django_db
from django.test import TestCase
from hello.models import Screener
from .models_user import Account
from hello.watchlist_service import WatchlistService

class WatchlistServiceTest(TestCase):
    def setUp(self):
        self.account = Account.objects.create(
            name="Test User",
            phone_number="1234567890",
            email="test@example.com",
            password_hash="hashed",
            api_key="testapikey"
        )
        self.service = WatchlistService()

    def test_add_and_get_stock(self):
        watchlist = self.service.add(self.account.api_key, "AAPL")
        assert any(stock['symbol'] == "AAPL" for stock in watchlist)

        watchlist = self.service.add(self.account.api_key, "TSLA")
        assert any(stock['symbol'] == "TSLA" for stock in watchlist)
        assert len(watchlist) == 2

    def test_remove_stock(self):
        self.service.add(self.account.api_key, "AAPL")
        self.service.add(self.account.api_key, "TSLA")
        watchlist = self.service.remove(self.account.api_key, "AAPL")
        assert not any(stock['symbol'] == "AAPL" for stock in watchlist)
        assert any(stock['symbol'] == "TSLA" for stock in watchlist)

    def test_search_stock(self):
        self.service.add(self.account.api_key, "AAPL")
        self.service.add(self.account.api_key, "TSLA")
        results = self.service.search(self.account.api_key, "AAP")
        assert any(stock['symbol'] == "AAPL" for stock in results)
        assert not any(stock['symbol'] == "TSLA" for stock in results)

    def test_watchlist_is_user_specific(self):
        account2 = Account.objects.create(
            name="Other User",
            phone_number="0987654321",
            email="other@example.com",
            password_hash="hashed2",
            api_key="otherapikey"
        )
        self.service.add(self.account.api_key, "AAPL")
        self.service.add(account2.api_key, "TSLA")
        wl1 = self.service.get(self.account.api_key)
        wl2 = self.service.get(account2.api_key)
        assert any(stock['symbol'] == "AAPL" for stock in wl1)
        assert not any(stock['symbol'] == "TSLA" for stock in wl1)
        assert any(stock['symbol'] == "TSLA" for stock in wl2)
        assert not any(stock['symbol'] == "AAPL" for stock in wl2)

    def test_add_prebuilt_screener_to_watchlist(self):
        screener = Screener.objects.create(
            name="Tech Giants",
            description="Large technology companies with high market cap"
        )
        
        self.service.add(self.account.api_key, "AAPL")
        
        result = self.service.add_screener(self.account.api_key, screener.id)
        assert result == True
        
        screeners = self.service.get_screeners(self.account.api_key)
        assert len(screeners) == 1
        assert screeners[0]['name'] == "Tech Giants"
        assert screeners[0]['description'] == "Large technology companies with high market cap"
        assert screeners[0]['id'] == screener.id

    def test_remove_prebuilt_screener_from_watchlist(self):
        screener = Screener.objects.create(
            name="Value Stocks",
            description="Undervalued stocks with low P/E ratios"
        )
        
        self.service.add(self.account.api_key, "AAPL")
        
        self.service.add_screener(self.account.api_key, screener.id)
        
        screeners = self.service.get_screeners(self.account.api_key)
        assert len(screeners) == 1
        
        result = self.service.remove_screener(self.account.api_key, screener.id)
        assert result == True
        
        screeners = self.service.get_screeners(self.account.api_key)
        assert len(screeners) == 0

    def test_add_duplicate_screener_to_watchlist(self):
        screener = Screener.objects.create(
            name="Dividend Stocks",
            description="Stocks with high dividend yield"
        )
        
        self.service.add(self.account.api_key, "AAPL")
        
        result1 = self.service.add_screener(self.account.api_key, screener.id)
        result2 = self.service.add_screener(self.account.api_key, screener.id)
        
        assert result1 == True
        assert result2 == True
        
        screeners = self.service.get_screeners(self.account.api_key)
        assert len(screeners) == 1
