from django.test import TestCase
import pytest
from .get_stock_info import search_stocks

class SearchStocksTests(TestCase):
    def test_search_stocks_found(self):
        query = "Apple"
        results = search_stocks(query)
        self.assertTrue(any("Apple" in stock['name'] for stock in results))

    def test_search_stocks_not_found(self):
        query = "NonExistentCompany"
        results = search_stocks(query)
        self.assertEqual(len(results), 0)

    def test_search_stocks_case_insensitive(self):
        query = "aPpLe"
        results = search_stocks(query)
        self.assertTrue(any("Apple" in stock['name'] for stock in results))