import logging
from pathlib import Path
from typing import List
import yfinance as yf
import pandas as pd
import requests
import os
from .models import StockModel
from dotenv import load_dotenv

load_dotenv()

def fetch_and_update_symbols():
    data = fetch_new_stocks_from_finnhub()
    update_stocks_in_db_from_finnhub(data)

def fetch_new_stocks_from_finnhub():
    token = os.environ.get('FINNHUB_TOKEN')
    if token is None or str(token).strip() == '':
        print('FINNHUB_TOKEN not set in environment')
        return []
    url = f'https://finnhub.io/api/v1/stock/symbol?exchange=US&token={token}'
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data
    except Exception as e:
        print(f"Error fetching Finnhub symbols: {e}")
        return []

def update_stocks_in_db_from_finnhub(stock_data):
    for entry in stock_data:
        symbol = entry.get('symbol')
        description = entry.get('description', '')
        if symbol:
            company_name = description.title()
            # Skip stocks violating table rules
            if len(symbol) > 4:
                print(f"Skipping symbol '{symbol}' (length > 4)")
                continue
            StockModel.objects.update_or_create(
                symbol=symbol,
                defaults={'company_name': company_name}
            )

def get_unique_sectors():
    return ["basic-materials",
            "communication-services",
            "consumer-cyclical",
            "consumer-defensive",
            "energy",
            "financial-services",
            "healthcare",
            "industrials",
            "real-estate",
            "technology",
            "utilities"]

def get_unique_industries(sectors=None):
    industries = {}
    for sec in sectors:
        s = yf.Sector(sec)
        industries[sec] = list(s.industries.index.values)
    return industries