
import pytest
from yfinance import EquityQuery
from Incrementum.DTOs.ifilterdata import FilterData
from Screeners.screener_constructor import ScreenerConstructor

# def assert_queries_equal_list(actual_list, expected_list):
#     assert len(actual_list) == len(expected_list), f"length mismatch: {len(actual_list)} != {len(expected_list)}"
#     for a, e in zip(actual_list, expected_list):
#         assert str(a) == str(e), f"Query mismatch: {a} != {e}"


# @pytest.mark.parametrize("filters, expected_count", [
#     ([], 0),
#     ([FilterData('gt', 'avgdailyvol3m', 'numeric', 1000000)], 1),
#     ([FilterData('eq', 'sector', 'categorical', 'Technology')], 1),
#     ([
#         FilterData('gt', 'avgdailyvol3m', 'numeric', 1000000),
#         FilterData('eq', 'sector', 'categorical', 'Technology')
#     ], 2),
#     ([FilterData('btwn', 'lastclose52weekhigh.lasttwelvemonths', 'numeric', [150, 300])], 1)
# ])
# def test_screener_construction(filters, expected_count):
#     constructor = ScreenerConstructor(filters)

#     categoricals = []
#     numerics = []
#     for f in filters:
#         op = f.operator
#         operand = f.operand
#         value = f.value
#         if f.filter_type == 'categorical':
#             categoricals.append(EquityQuery(op, [operand, value]))
#         else:
#             numerics.append(EquityQuery(op, [operand, value] if f.operator != 'btwn' else [operand, value[0], value[1]]))

#     expected = categoricals + numerics

#     assert len(constructor.filters_numeric+constructor.filters_categorical[0]) == expected_count

#     if expected_count == 0:
#         assert constructor.filters == []
#         return
    
#     assert_queries_equal_list(constructor.filters, expected)


# def test_screener_construction_with_mock(screener_constructor_with_mock):
#     # Using the fixture that monkeypatches EquityQuery to MockEquityQuery
#     build = screener_constructor_with_mock
#     filters = [
#         FilterData('eq', 'sector', 'categorical', 'Energy'),
#         FilterData('gt', 'avgdailyvol3m', 'numeric', 5000000),
#     ]
#     constructor = build(filters)
#     # Ensure ordering: categoricals first, numerics second
#     ops = [q.operator.lower() for q in constructor.filters]
#     assert ops == ['eq', 'gt']
#     # Basic operand/value shape assertions
#     payloads = [getattr(q, 'operand', None) or getattr(q, 'args', None) for q in constructor.filters]
#     assert payloads[0][0] == 'sector' and payloads[0][1] == 'Energy'
#     assert payloads[1][0] == 'avgdailyvol3m' and payloads[1][1] == 5000000




