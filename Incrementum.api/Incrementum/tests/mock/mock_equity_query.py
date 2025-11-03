"""MockEquityQuery
===================
A lightweight stand‑in for yfinance's EquityQuery for use in unit tests.

Goals:
- Minimal API surface: operator plus either a leaf operand [field, value]
  or a composite list of subqueries when operator == 'and'.
- Deterministic equality & hashing so it can be compared directly or placed in sets.
- Human‑readable repr for debugging test failures.

Typical usage patterns:
-----------------------
1. Dependency injection (preferred if production code allows):
   from tests.mock.mock_equity_query import MockEquityQuery
   constructor = ScreenerConstructor(filters, query_cls=MockEquityQuery)

2. Monkeypatch import inside module under test:
   monkeypatch.setattr('Screeners.screener_constructor.EquityQuery', MockEquityQuery)

3. Building expected queries in tests:
   expected = [
       MockEquityQuery('eq', ['sector', 'Technology']),
       MockEquityQuery('gt', ['market_cap', 1000000])
   ]

Normalization helper:
---------------------
Use MockEquityQuery.normalize(q) to convert any supported query (mock or realish) to a tuple
for structural comparison: (operator, payload). Composite payload is a tuple of normalized children.

Limitations:
------------
This mock intentionally does NOT implement any networking or screening logic.
"""
from __future__ import annotations
from typing import Any, Iterable, Sequence, Tuple

class MockEquityQuery:
    __slots__ = ("operator", "operand", "subqueries")

    def __init__(self, operator: str | None = None, operand: Any = None):
        self.operator = operator
        # For an 'and' composite, operand is expected to be an iterable of subqueries
        if operator == 'and' and operand is not None:
            self.subqueries = list(operand)
            self.operand = None
        else:
            self.subqueries = None
            self.operand = operand  # leaf form: typically [field, value]

    # Convenience alternate constructor for composites
    @classmethod
    def And(cls, *queries: 'MockEquityQuery') -> 'MockEquityQuery':
        return cls('and', list(queries))

    def is_composite(self) -> bool:
        return self.operator == 'and' and self.subqueries is not None

    def to_tuple(self) -> Tuple:
        if self.is_composite():
            return (self.operator, tuple(q.to_tuple() for q in self.subqueries))
        return (self.operator, tuple(self.operand) if isinstance(self.operand, Sequence) and not isinstance(self.operand, (str, bytes)) else self.operand)

    # Structural equality
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, MockEquityQuery):
            return False
        return self.to_tuple() == other.to_tuple()

    def __hash__(self) -> int:  # allows usage in sets/dicts
        return hash(self.to_tuple())

    def __repr__(self) -> str:
        if self.is_composite():
            return f"MockEquityQuery(and, {self.subqueries!r})"
        return f"MockEquityQuery({self.operator!r}, {self.operand!r})"

    # Static normalization that can accept either this mock or a real EquityQuery (best effort)
    @staticmethod
    def normalize(q: Any) -> Tuple:
        if isinstance(q, MockEquityQuery):
            return q.to_tuple()
        # best effort for real EquityQuery-like objects
        op = getattr(q, 'operator', None)
        sub = getattr(q, 'subqueries', None) or getattr(q, 'queries', None)
        if sub:
            return (op, tuple(MockEquityQuery.normalize(s) for s in sub))
        operand = getattr(q, 'operand', None) or getattr(q, 'args', None)
        if operand is None:
            return (op, None)
        if isinstance(operand, (list, tuple)) and len(operand) == 2:
            return (op, tuple(operand))
        return (op, tuple(operand) if isinstance(operand, (list, tuple)) else operand)

__all__ = ["MockEquityQuery"]
