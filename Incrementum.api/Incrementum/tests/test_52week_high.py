import pytest
from Incrementum.stocks_class import Stock
import pandas as pd
from Screeners.moving_average_52 import fifty_two_high

def values():
    sample_stocks = [
        {
            "symbol": "AAPL",
            "displayName": "Apple Inc.",
            "sector": "Technology",
            "sectorKey": "technology",
            "industry": "Consumer Electronics",
            "industryKey": "consumer_electronics",
            "country": "USA",
            "currentPrice": 185.32,
            "price_52w_high": 190.12,
            "fiftyDayAverage": 182.50,
            "dayHigh": 186.00,
            "dayLow": 183.40,
            "previousClose": 184.20,
            "exchange": "NASDAQ",
            "fullExchangeName": "NasdaqGS",
            "regularMarketChangePercent": 0.61,
        },
        {
            "symbol": "MSFT",
            "displayName": "Microsoft Corp.",
            "sector": "Technology",
            "sectorKey": "technology",
            "industry": "Software—Infrastructure",
            "industryKey": "software_infrastructure",
            "country": "USA",
            "currentPrice": 330.10,
            "price_52w_high": 360.00,
            "fiftyDayAverage": 325.60,
            "dayHigh": 331.00,
            "dayLow": 328.50,
            "previousClose": 329.00,
            "exchange": "NASDAQ",
            "fullExchangeName": "NasdaqGS",
            "regularMarketChangePercent": 0.33,
        },
        {
            "symbol": "TSLA",
            "displayName": "Tesla Inc.",
            "sector": "Consumer Cyclical",
            "sectorKey": "consumer_cyclical",
            "industry": "Auto Manufacturers",
            "industryKey": "auto_manufacturers",
            "country": "USA",
            "currentPrice": 245.60,
            "price_52w_high": 300.50,
            "fiftyDayAverage": 240.20,
            "dayHigh": 248.00,
            "dayLow": 243.00,
            "previousClose": 244.10,
            "exchange": "NASDAQ",
            "fullExchangeName": "NasdaqGS",
            "regularMarketChangePercent": 0.78,
        },
        {
            "symbol": "NVDA",
            "displayName": "NVIDIA Corporation",
            "sector": "Technology",
            "sectorKey": "technology",
            "industry": "Semiconductors",
            "industryKey": "semiconductors",
            "country": "USA",
            "currentPrice": 470.00,
            "price_52w_high": 495.00,
            "fiftyDayAverage": 465.20,
            "dayHigh": 472.00,
            "dayLow": 468.10,
            "previousClose": 469.50,
            "exchange": "NASDAQ",
            "fullExchangeName": "NasdaqGS",
            "regularMarketChangePercent": 0.12,
        }
    ]
    stocks = []
    for stock in sample_stocks:
        stocks.append(Stock(stock))
    return stocks
def test_52high():
    stocks = values()
    screener = fifty_two_high(490)
    assert len(screener.screen(stocks)) == 1
    assert screener.screen(stocks)[0].symbol == "NVDA"