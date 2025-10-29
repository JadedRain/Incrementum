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

def get_unique_industries(csv_path: Path | str) -> List[str]:
    path = Path(csv_path)
    df = pd.read_csv(path)
    # The file has a header with 'industryKey' column
    if 'industryKey' not in df.columns:
        raise ValueError('CSV does not contain industryKey column')

    industries = df['industryKey'].dropna().astype(str)
    # Filter out placeholder values like 'N/A' or empty strings
    industries = industries[~industries.str.strip().isin(['', 'N/A', 'NA', 'nan'])]
    unique = sorted(industries.unique().tolist(orient='records'))
    return unique

def get_industries_2(sectors):
    industries = {}
    for sec in sectors:
        s = yf.Sector(sec)
        industries[sec] = list(s.industries.index.values)
    return industries