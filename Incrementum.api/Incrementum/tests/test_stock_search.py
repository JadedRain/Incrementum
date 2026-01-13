import pytest
from Incrementum.get_stock_info import search_stocks
from Incrementum.models.stock import StockModel

pytestmark = pytest.mark.django_db


def test_symbol_priority():
    results = search_stocks('TS', 0)
    symbols = [r.symbol for r in results]

    assert all(s.startswith('TS') for s in symbols if s.startswith('TS'))


def test_name_fallback():
    StockModel.objects.create(symbol='TECH1', company_name='Acme Technologies')
    results = search_stocks('Technologies', 0)
    assert any('Technologies' in r['name'] for r in results)
