import pytest
from yfinance import EquityQuery
from hello.DTOs.ifilterdata import FilterData
from Screeners.screener_constructor import ScreenerConstructor

def assert_queries_equal_list(actual_list, expected_list):
    assert len(actual_list) == len(expected_list), f"length mismatch: {len(actual_list)} != {len(expected_list)}"
    for a, e in zip(actual_list, expected_list):
        assert str(a) == str(e), f"Query mismatch: {a} != {e}"


@pytest.mark.parametrize("filters, expected_count", [
    ([], 0),
    ([FilterData('gt', 'avgdailyvol3m', 'numeric', 1000000)], 1),
    ([FilterData('eq', 'sector', 'categorical', 'Technology')], 1),
    ([
        FilterData('gt', 'avgdailyvol3m', 'numeric', 1000000),
        FilterData('eq', 'sector', 'categorical', 'Technology')
    ], 2),
    ([FilterData('btwn', 'lastclose52weekhigh.lasttwelvemonths', 'numeric', [150, 300])], 1)
])
def test_screener_construction(filters, expected_count):
    constructor = ScreenerConstructor(filters)

    categoricals = []
    numerics = []
    for f in filters:
        op = f.operator
        operand = f.operand
        value = f.value
        if f.filter_type == 'categorical':
            categoricals.append(EquityQuery(op, [operand, value]))
        else:
            numerics.append(EquityQuery(op, [operand, value] if f.operator != 'btwn' else [operand, value[0], value[1]]))

    expected = categoricals + numerics

    assert len(constructor.filters) == expected_count

    if expected_count == 0:
        assert constructor.filters == []
        return
    
    assert_queries_equal_list(constructor.filters, expected)




