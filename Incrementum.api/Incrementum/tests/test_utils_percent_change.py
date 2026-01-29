import pytest
import pandas as pd
from datetime import datetime, timedelta
from Incrementum.utils import calculate_percent_change
from unittest.mock import patch


def make_test_df_day():
    now = datetime.now()
    idx = [now - timedelta(days=1), now]
    data = {
        'Close': [100, 110],
        'Open': [95, 105],
        'High': [101, 111],
        'Low': [94, 104],
        'Volume': [1000, 1200],
    }
    df = pd.DataFrame(data, index=idx)
    return df


def make_test_df_hour():
    now = datetime.now()
    idx = [now - timedelta(hours=1), now]
    data = {
        'Close': [200, 220],
        'Open': [195, 210],
        'High': [201, 221],
        'Low': [194, 209],
        'Volume': [500, 600],
    }
    df = pd.DataFrame(data, index=idx)
    return df


@patch('Incrementum.utils.StockHistoryService')
def test_percent_change_day_simulated(MockSHS):
    instance = MockSHS.return_value
    instance.history.return_value = (make_test_df_day(), {})
    pct, _ = calculate_percent_change('FAKE', mode='day')
    assert pct == pytest.approx(0.10)


@patch('Incrementum.utils.StockHistoryService')
def test_percent_change_hour_simulated(MockSHS):
    instance = MockSHS.return_value
    instance.history.return_value = (make_test_df_hour(), {})
    pct, _ = calculate_percent_change('FAKE', mode='hour')
    assert pct == pytest.approx(0.10)
