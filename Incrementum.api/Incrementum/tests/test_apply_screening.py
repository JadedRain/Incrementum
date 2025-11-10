import pytest
from unittest.mock import patch
from Incrementum.DTOs.ifilterdata import FilterData
from Screeners.screener_constructor import ScreenerConstructor

class FakeLeafQuery:
    def __init__(self, operator, payload):
        self.operator = operator
        self.payload = payload
    def get_stocks(self):
        # Single leaf query returns one stock with US region
        return [{"symbol": "STK0", "filters_applied": 1, "region": "us"}]
    def __repr__(self):
        return f"FakeLeafQuery({self.operator}, {self.payload})"

class FakeAndQuery:
    def __init__(self, operator, subqueries):
        self.operator = operator
        self.subqueries = subqueries
    def get_stocks(self):
        return [
            {"symbol": f"STK{i}", "filters_applied": len(self.subqueries), "region": "us"}
            for i in range(len(self.subqueries))
        ]
    def __repr__(self):
        return f"FakeAndQuery(and, {self.subqueries!r})"

class FakeEquityQuery:
    def __new__(cls, operator=None, payload=None):
        if operator == 'and':
            return FakeAndQuery(operator, payload)
        return FakeLeafQuery(operator, payload)

def fake_screen(query, offset, size):
    if hasattr(query, 'get_stocks'):
        return query.get_stocks()
    return []

@pytest.mark.parametrize("filters, expected_symbols", [
    ([], ["STK0"]),  # Empty user filters, but region filter is applied, so returns stock
    ([FilterData('eq', 'sector', 'categoric', 'Tech')], ["STK0", "STK1"]),  # 1 user filter + 1 region filter = 2 total
    ([
        FilterData('eq', 'sector', 'categoric', 'Tech'),
        FilterData('gt', 'avgdailyvol3m', 'numeric', 1000000)
    ], ["STK0", "STK1", "STK2"]),  # 2 user filters + 1 region filter = 3 total
])
@patch('Screeners.screener_constructor.screen', side_effect=fake_screen)
def test_apply_screening(mock_screen, filters, expected_symbols):
    constructor = ScreenerConstructor(filters, Eq=FakeEquityQuery)
    stocks = constructor.apply_screening()
    
    returned_symbols = [s["symbol"] for s in stocks]
    assert returned_symbols == expected_symbols

    # Check filters_applied count
    if not filters:
        # Only region filter applied
        for s in stocks:
            assert s["filters_applied"] == 1
    else:
        # User filters + region filter
        for s in stocks:
            assert s["filters_applied"] == len(filters) + 1


# --- Enhanced filtering semantics test ---

class DatasetFilteringLeafQuery(FakeLeafQuery):
    def get_stocks(self):
        # Simulated underlying dataset - all stocks are in US region
        data = [
            {"symbol": "AAA", "sector": "Tech", "avgdailyvol3m": 2_000_000, "region": "us"},
            {"symbol": "BBB", "sector": "Finance", "avgdailyvol3m": 5_000_000, "region": "us"},
            {"symbol": "CCC", "sector": "Tech", "avgdailyvol3m": 500_000, "region": "us"},
            {"symbol": "DDD", "sector": "Energy", "avgdailyvol3m": 3_500_000, "region": "us"},
        ]
        # Apply single leaf condition
        op = self.operator.lower()
        field, value = self.payload[0], self.payload[1]
        if op == 'eq':
            return [r for r in data if r.get(field) == value]
        elif op == 'gt':
            return [r for r in data if r.get(field, 0) > value]
        elif op == 'gte':
            return [r for r in data if r.get(field, 0) >= value]
        elif op == 'lt':
            return [r for r in data if r.get(field, 0) < value]
        elif op == 'lte':
            return [r for r in data if r.get(field, 0) <= value]
        return data

class DatasetFilteringAndQuery(FakeAndQuery):
    def get_stocks(self):
        # Simulated underlying dataset - all stocks are in US region
        data = [
            {"symbol": "AAA", "sector": "Tech", "avgdailyvol3m": 2_000_000, "region": "us"},
            {"symbol": "BBB", "sector": "Finance", "avgdailyvol3m": 5_000_000, "region": "us"},
            {"symbol": "CCC", "sector": "Tech", "avgdailyvol3m": 500_000, "region": "us"},
            {"symbol": "DDD", "sector": "Energy", "avgdailyvol3m": 3_500_000, "region": "us"},
        ]
        # Reduce dataset by applying all subquery leaf conditions (AND semantics)
        filtered = data
        for leaf in self.subqueries:
            op = leaf.operator.lower()
            field, value = leaf.payload[0], leaf.payload[1]
            if op == 'eq':
                filtered = [r for r in filtered if r.get(field) == value]
            elif op == 'gt':
                filtered = [r for r in filtered if r.get(field, 0) > value]
            elif op == 'gte':
                filtered = [r for r in filtered if r.get(field, 0) >= value]
            elif op == 'lt':
                filtered = [r for r in filtered if r.get(field, 0) < value]
            elif op == 'lte':
                filtered = [r for r in filtered if r.get(field, 0) <= value]
        return filtered

class DatasetFilteringEquityQuery(FakeEquityQuery):
    def __new__(cls, operator=None, payload=None):
        if operator == 'and':
            return DatasetFilteringAndQuery(operator, payload)
        return DatasetFilteringLeafQuery(operator, payload)

@pytest.mark.parametrize(
    "filters,expected",
    [
        # sector == Tech (no volume restriction) -> AAA & CCC
        ([FilterData('eq', 'sector', 'categoric', 'Tech')], {'AAA', 'CCC'}),
        # sector == Tech & volume > 1M -> AAA only
        ([
            FilterData('eq', 'sector', 'categoric', 'Tech'),
            FilterData('gt', 'avgdailyvol3m', 'numeric', 1_000_000)
        ], {'AAA'}),
        # volume > 3M -> BBB (5M) & DDD (3.5M)
        ([FilterData('gt', 'avgdailyvol3m', 'numeric', 3_000_000)], {'BBB', 'DDD'}),
        # sector == Energy & volume >= 3M -> DDD only
        ([
            FilterData('eq', 'sector', 'categoric', 'Energy'),
            FilterData('gte', 'avgdailyvol3m', 'numeric', 3_000_000)
        ], {'DDD'}),
        # sector == Finance & volume < 6M -> BBB only
        ([
            FilterData('eq', 'sector', 'categoric', 'Finance'),
            FilterData('lt', 'avgdailyvol3m', 'numeric', 6_000_000)
        ], {'BBB'}),
    ]
)
@patch('Screeners.screener_constructor.screen', side_effect=fake_screen)
def test_apply_screening_filters_data(mock_screen, filters, expected):
    constructor = ScreenerConstructor(filters, Eq=DatasetFilteringEquityQuery)
    results = constructor.apply_screening()
    symbols = {r['symbol'] for r in results}
    assert symbols == expected
