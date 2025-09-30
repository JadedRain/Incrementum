import pytest
pytestmark = pytest.mark.django_db
from unittest.mock import patch
from .stocks_class import Stock
from .watchlist_service import WatchlistService
from hello.models import Account


def fake_fetch_stock_data(symbol):
    """Fake fetch_stock_data function for testing."""
    json_data = {
        "country": "USA",
        "currentPrice": 150.0,
        "dayHigh": 155.0,
        "dayLow": 145.0,
        "exchange": "NASDAQ",
        "displayName": f"{symbol} Inc.",
        "fiftyDayAverage": 148.0,
        "fullExchangeName": "NasdaqGS",
        "industry": "Technology",
        "industryKey": "tech",
        "longName": f"{symbol} Inc.",
        "open": 148.5,
        "previousClose": 149.0,
        "shortName": symbol,
        "symbol": symbol,
        "sector": "Technology",
        "sectorKey": "tech",
    }
    return Stock(json_data)

@pytest.fixture
def wl(db):
    account = Account.objects.create(
        name="Test User",
        phone_number="1234567890",
        email="test@example.com",
        password_hash="hashed",
        api_key="testapikey"
    )
    user_id = account.id
    w = WatchlistService(fake_fetch_stock_data)
    w.add(user_id, "AAPL")
    w.add(user_id, "TSLA")
    w._user_id = user_id
    return w

def test_get_all_returns_stocks(wl):
    stocks = wl.get(wl._user_id)
    assert all(isinstance(s, dict) for s in stocks)
    assert {s["symbol"] for s in stocks} == {"AAPL", "TSLA"}


def test_add_returns_stock(wl):
    wl.add(wl._user_id, "MSFT")
    assert "MSFT" in [s["symbol"] for s in wl.get(wl._user_id)]


def test_add_duplicate_does_not_duplicate(wl):
    wl.add(wl._user_id, "AAPL")
    symbols = [s["symbol"] for s in wl.get(wl._user_id)]
    assert symbols.count("AAPL") == 1


def test_remove_removes_stocks(wl):
    wl.remove(wl._user_id, "AAPL")
    stocks = wl.get(wl._user_id)
    assert all(isinstance(s, dict) for s in stocks)
    symbols = [s["symbol"] for s in stocks]
    assert "AAPL" not in symbols
    assert "TSLA" in symbols


def test_remove_nonexistent_symbol_does_nothing(wl):
    before = [s["symbol"] for s in wl.get(wl._user_id)]
    wl.remove(wl._user_id, "GOOG")
    after = [s["symbol"] for s in wl.get(wl._user_id)]
    assert before == after


def test_search_exact_match(wl):
    results = wl.search(wl._user_id, "AAPL")
    assert [s["symbol"] for s in results] == ["AAPL"]


def test_search_partial_match(wl):
    results = wl.search(wl._user_id, "AAP")
    symbols = [s["symbol"] for s in results]
    assert "AAPL" in symbols


def test_search_case_insensitive(wl):
    results = wl.search(wl._user_id, "tsl")
    assert [s["symbol"] for s in results] == ["TSLA"]

