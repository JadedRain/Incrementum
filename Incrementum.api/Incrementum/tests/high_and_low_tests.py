from Incrementum.services.high_and_low import local_high_opens, local_low_opens
import pytest
import pandas as pd
import os


# Get the directory of this test file
TEST_DIR = os.path.dirname(__file__)


@pytest.mark.parametrize("test_input,expectedlst",
                         [(os.path.join(TEST_DIR, "dataset1.csv"),
                           ["2025-10-20 09:30:00-04:00",
                            "2025-10-20 10:30:00-04:00",
                            "2025-10-20 13:00:00-04:00"]),
                          (os.path.join(TEST_DIR, "dataset2.csv"),
                           ["2025-10-20 00:00:00-04:00",
                            "2025-10-29 00:00:00-04:00"]),
                          (os.path.join(TEST_DIR, "dataset3.csv"),
                           ["2025-11-18 09:30:00-05:00",
                            "2025-11-18 09:34:00-05:00"])])
def test_high(test_input, expectedlst):
    data = pd.read_csv(test_input)
    print(local_high_opens(data))
    print(expectedlst)
    assert local_high_opens(data) == expectedlst


@pytest.mark.parametrize("test_input,expectedlst",
                         [(os.path.join(TEST_DIR, "dataset1.csv"),
                           ["2025-10-20 10:00:00-04:00",
                            "2025-10-20 12:00:00-04:00"]),
                          (os.path.join(TEST_DIR, "dataset2.csv"),
                           ["2025-10-23 00:00:00-04:00"]),
                          (os.path.join(TEST_DIR, "dataset3.csv"),
                           ["2025-11-18 09:32:00-05:00",
                            "2025-11-18 09:37:00-05:00"]
                           )])
def test_low(test_input, expectedlst):
    data = pd.read_csv(test_input)
    print(local_low_opens(data))
    print(expectedlst)
    assert local_low_opens(data) == expectedlst
