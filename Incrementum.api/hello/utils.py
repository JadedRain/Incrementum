from pathlib import Path
from typing import List

import pandas as pd


def get_unique_sectors(csv_path: Path | str) -> List[str]:
    path = Path(csv_path)
    df = pd.read_csv(path)
    # The file has a header with 'sectorKey' column
    if 'sectorKey' not in df.columns:
        raise ValueError('CSV does not contain sectorKey column')

    sectors = df['sectorKey'].dropna().astype(str)
    # Filter out placeholder values like 'N/A' or empty strings
    sectors = sectors[~sectors.str.strip().isin(['', 'N/A', 'NA', 'nan'])]
    unique = sorted(sectors.unique().tolist())
    return unique
