import pytest
import pandas as pd
from hello.stocks_class import Stock
from Screeners.current_share_price import current_share_price
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

def test_current_share_price_both_max_and_min():
    stocks = values()
    screener = current_share_price(min_value=0, max_value=200)
    assert len(screener.screen(stocks)) == 1
    assert screener.screen(stocks)[0].symbol == "AAPL"

def test_current_share_price_just_min():
    stocks = values()
    screener = current_share_price(min_value=200)
    assert len(screener.screen(stocks)) == 3
    assert screener.screen(stocks)[1].symbol == "TSLA"
    assert screener.screen(stocks)[0].symbol == "MSFT"
    assert screener.screen(stocks)[2].symbol == "NVDA"

def test_current_share_price_just_max():
    stocks = values()
    screener = current_share_price(max_value=200)
    assert len(screener.screen(stocks)) == 1
    assert screener.screen(stocks)[0].symbol == "AAPL"

def test_current_share_price_wrong_input():
    with pytest.raises(ValueError):
        current_share_price(min_value="abc", max_value=200)
    with pytest.raises(ValueError):
        current_share_price(min_value=100, max_value="xyz")

def test_current_share_price_with_other_filters():
    stocks = values()
    screener = current_share_price(min_value=240, max_value=500)
    assert len(screener.screen(stocks)) == 3
    assert screener.screen(stocks)[0].symbol == "MSFT"
    assert screener.screen(stocks)[1].symbol == "TSLA"
    assert screener.screen(stocks)[2].symbol == "NVDA"
    
    filtered_stocks = screener.screen(stocks)
    filtered_stocks = fifty_two_high(490).screen(filtered_stocks)
    assert len(filtered_stocks) == 1
    assert filtered_stocks[0].symbol == "NVDA"