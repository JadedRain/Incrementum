import logging
from pathlib import Path
from typing import List
import pandas as pd
from hello.data.sector_industry import get_sectors_industry

def get_unique_sectors():
    return ["Basic Materials",
            "Communication Services",
            "Consumer Cyclical",
            "Consumer Defensive",
            "Energy",
            "Financial Services",
            "Healthcare",
            "Industrials",
            "Real Estate",
            "Technology", 
            "Utilities"
    ]

def get_unique_industries(sectors=None):
    industries = {}
    s = get_sectors_industry()
    for sec in sectors:
        industries[sec] = list(s[sec])
    return industries