import pytest
from unittest.mock import patch

from Incrementum.DTOs.ifilterdata import FilterData
from Screeners.screener_constructor_new import NewScreenerConstructor


class DummyStock:
    def __init__(self, symbol, **attrs):
        self.symbol = symbol
        for k, v in attrs.items():
            setattr(self, k, v)


def test_factor_categorical_raises_on_wrong_type():
    constructor = NewScreenerConstructor(filters=[])
    # create a FilterData with wrong type
    f = FilterData('eq', 'sector', 'numeric', 'Tech')
    with pytest.raises(ValueError):
        constructor.factor_categorical(f)


def test_apply_categoric_filter_equals_and_not_equals():
    constructor = NewScreenerConstructor(filters=[])
    stocks = [DummyStock('A', sector='Tech'), DummyStock('B', sector='Finance')]

    equals_cf = {'operator': 'equals', 'operand': 'sector', 'value': 'Tech'}
    res = constructor.apply_categoric_filter(stocks, equals_cf)
    assert [s.symbol for s in res] == ['A']

    not_equals_cf = {'operator': 'not_equals', 'operand': 'sector', 'value': 'Tech'}
    res2 = constructor.apply_categoric_filter(stocks, not_equals_cf)
    assert [s.symbol for s in res2] == ['B']


def test_apply_screening_uses_collection_service(monkeypatch):
    # Prepare constructor and categorical filter that should filter to sector=='Tech'
    f = FilterData('eq', 'sector', 'categorical', 'Tech')
    constructor = NewScreenerConstructor(filters=[f])
    constructor.categorical_filters = [constructor.factor_categorical(f)]

    # Stocks returned by the collection service
    all_stocks = [DummyStock('A', sector='Tech'), DummyStock('B', sector='Finance')]

    class DummyCollectionService:
        def __init__(self):
            pass

        def get_stocks_in_collection(self, collection_id):
            return [all_stocks[0]]

    # Ensure the constructor will use the collection path
    constructor.collection_filter = {'collection_id': 'my-collection'}
    monkeypatch.setattr('Screeners.screener_constructor_new.CustomCollectionService', DummyCollectionService)

    results = constructor.apply_screening()
    assert [s.symbol for s in results] == ['A']


def test_apply_screening_empty_collection(monkeypatch):
    # Constructor with no categorical filters but collection present
    constructor = NewScreenerConstructor(filters=[])
    constructor.categorical_filters = []
    constructor.collection_filter = {'collection_id': 'empty'}

    class DummyCollectionServiceEmpty:
        def get_stocks_in_collection(self, collection_id):
            return []

    monkeypatch.setattr('Screeners.screener_constructor_new.CustomCollectionService', DummyCollectionServiceEmpty)

    results = constructor.apply_screening()
    assert results == []
