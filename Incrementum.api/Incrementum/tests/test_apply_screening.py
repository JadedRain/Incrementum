import pytest
from Incrementum.DTOs.ifilterdata import FilterData
from Screeners.screener_constructor import ScreenerConstructor

class FakeLeafQuery:
    def __init__(self, operator, payload):
        self.operator = operator
        self.payload = payload
    def __repr__(self):
        return f"FakeLeafQuery({self.operator}, {self.payload})"

class FakeAndQuery:
    def __init__(self, operator, subqueries):
        self.operator = operator
        self.subqueries = subqueries
    def get_stocks(self):
        return [
            {"symbol": f"STK{i}", "filters_applied": len(self.subqueries)}
            for i in range(len(self.subqueries))
        ]
    def __repr__(self):
        return f"FakeAndQuery(and, {self.subqueries!r})"

class FakeEquityQuery:
    def __new__(cls, operator=None, payload=None):
        if operator == 'and':
            return FakeAndQuery(operator, payload)
        return FakeLeafQuery(operator, payload)

@pytest.mark.parametrize("filters, expected_symbols", [
    ([], []),
    ([FilterData('eq', 'sector', 'categorical', 'Tech')], ["STK0"]),
    ([
        FilterData('eq', 'sector', 'categorical', 'Tech'),
        FilterData('gt', 'avgdailyvol3m', 'numeric', 1000000)
    ], ["STK0", "STK1"]),
])
def test_apply_screening(filters, expected_symbols):
    constructor = ScreenerConstructor(filters, Eq=FakeEquityQuery)
    stocks = constructor.apply_screening()
    if not filters:
        assert stocks == []
    else:
        returned_symbols = [s["symbol"] for s in stocks]
        assert returned_symbols == expected_symbols

        for s in stocks:
            assert s["filters_applied"] == len(filters)


# --- Enhanced filtering semantics test ---

class DatasetFilteringAndQuery(FakeAndQuery):
    def get_stocks(self):
        # Simulated underlying dataset
        data = [
            {"symbol": "AAA", "sector": "Tech", "avgdailyvol3m": 2_000_000},
            {"symbol": "BBB", "sector": "Finance", "avgdailyvol3m": 5_000_000},
            {"symbol": "CCC", "sector": "Tech", "avgdailyvol3m": 500_000},
            {"symbol": "DDD", "sector": "Energy", "avgdailyvol3m": 3_500_000},
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
        return FakeLeafQuery(operator, payload)

@pytest.mark.parametrize(
    "filters,expected",
    [
        # sector == Tech (no volume restriction) -> AAA & CCC
        ([FilterData('eq', 'sector', 'categorical', 'Tech')], {'AAA', 'CCC'}),
        # sector == Tech & volume > 1M -> AAA only
        ([
            FilterData('eq', 'sector', 'categorical', 'Tech'),
            FilterData('gt', 'avgdailyvol3m', 'numeric', 1_000_000)
        ], {'AAA'}),
        # volume > 3M -> BBB (5M) & DDD (3.5M)
        ([FilterData('gt', 'avgdailyvol3m', 'numeric', 3_000_000)], {'BBB', 'DDD'}),
        # sector == Energy & volume >= 3M -> DDD only
        ([
            FilterData('eq', 'sector', 'categorical', 'Energy'),
            FilterData('gte', 'avgdailyvol3m', 'numeric', 3_000_000)
        ], {'DDD'}),
        # sector == Finance & volume < 6M -> BBB only
        ([
            FilterData('eq', 'sector', 'categorical', 'Finance'),
            FilterData('lt', 'avgdailyvol3m', 'numeric', 6_000_000)
        ], {'BBB'}),
    ]
)
def test_apply_screening_filters_data(filters, expected):
    constructor = ScreenerConstructor(filters, Eq=DatasetFilteringEquityQuery)
    results = constructor.apply_screening()
    symbols = {r['symbol'] for r in results}
    assert symbols == expected
