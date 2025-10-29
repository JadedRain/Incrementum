from pathlib import Path
from typing import List
import yfinance as yf
import pandas as pd

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

def get_unique_industries(sectors):
    industries = {}
    for sec in sectors:
        s = yf.Sector(sec)
        industries[sec] = list(s.industries.index.values)
    return industries