from unittest.mock import patch, MagicMock
import pandas as pd
from Incrementum.utils import get_unique_sectors, get_unique_industries


@patch('Incrementum.utils.get_sectors_industry')
def test_get_unique_sectors(mock_get_sectors_industry):
    # Mock the return value
    mock_get_sectors_industry.return_value = {
        'Technology': ['Software', 'Hardware'],
        'Healthcare': ['Pharma', 'Biotech']
    }

    sectors = get_unique_sectors()
    assert isinstance(sectors, list)
    assert "Technology" in sectors
    assert "Healthcare" in sectors


@patch('Incrementum.utils.yf.Sector')
def test_get_unique_industries(mock_sector_class):
    # Mock the Sector object and its industries attribute
    mock_sector = MagicMock()
    mock_sector.industries = pd.DataFrame(
        index=["Communication Equipment", "Software", "Hardware"]
    )
    mock_sector_class.return_value = mock_sector

    industries = get_unique_industries(["Technology"])
    assert "Communication Equipment" in industries["Technology"]
