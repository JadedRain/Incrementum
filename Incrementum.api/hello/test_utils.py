from pathlib import Path

from .utils import get_unique_sectors


def test_get_unique_sectors_contains_known_value():
    csv_path = Path(__file__).parent / 'data' / 'ticker_info.csv'
    sectors = get_unique_sectors(csv_path)

    # Basic sanity checks
    assert isinstance(sectors, list)
    assert len(sectors) > 0
