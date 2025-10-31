from django.test import TestCase
import pytest
from hello.get_stock_info import search_stocks

class SearchStocksTests(TestCase):
    def setUp(self):
        from hello.models import StockModel
        StockModel.objects.all().delete()
        StockModel.objects.create(symbol='AAPL', company_name='Apple')
    def test_search_stocks_found(self):
        query = "APPL"
        results = search_stocks(query, 0)
        print(results)
        self.assertTrue(any("Apple" in stock['name'] for stock in results))

    def test_search_stocks_not_found(self):
        query = "NonExistentCompany"
        results = search_stocks(query, 0)
        self.assertEqual(len(results), 0)

    def test_search_stocks_case_insensitive(self):
        query = "App"
        results = search_stocks(query, 0)
        self.assertTrue(any("Apple" in stock['name'] for stock in results))
    
    def test_search_stocks_partial_match(self): 
        query = "APP"
        results = search_stocks(query, 0)
        self.assertTrue(any("Apple" in stock['name'] for stock in results))