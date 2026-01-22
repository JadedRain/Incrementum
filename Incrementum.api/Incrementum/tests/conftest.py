import pytest
import Screeners.screener_constructor as sc_mod
from Incrementum.tests.mock.mock_equity_query import MockEquityQuery

try:
    from Screeners.screener_constructor import ScreenerConstructor as _SC
    _HAS_CONSTRUCTOR = True
except Exception:
    _HAS_CONSTRUCTOR = False
    _SC = None


@pytest.fixture
def mock_equity_query_cls():
    return MockEquityQuery


@pytest.fixture
def inject_mock_equity_query(monkeypatch):
    if not _HAS_CONSTRUCTOR:
        pytest.skip("ScreenerConstructor unavailable for monkeypatch")
    monkeypatch.setattr(sc_mod, 'EquityQuery', MockEquityQuery)
    return MockEquityQuery


@pytest.fixture
def screener_constructor_with_mock(inject_mock_equity_query):  # depends on monkeypatch fixture
    if not _HAS_CONSTRUCTOR:
        pytest.skip("ScreenerConstructor unavailable")
    from Screeners.screener_constructor import ScreenerConstructor

    def _builder(filters):
        # Explicitly pass Eq to avoid using the original default captured before monkeypatch
        return ScreenerConstructor(filters, Eq=MockEquityQuery)

    return _builder


def test_combo(screener_constructor_with_mock):
    build = screener_constructor_with_mock
    c = build([
        {
            'operator': 'eq',
            'operand': 'sector',
            'filter_type': 'categorical',
            'value': 'Technology',
        },
        {
            'operator': 'gt',
            'operand': 'avgvolume3m',
            'filter_type': 'numeric',
            'value': 1000000,
        },
    ])
    assert [q.operator for q in c.filters] == ['eq', 'gt']
