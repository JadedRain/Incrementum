from Incrementum.services.high_and_low import local_high_opens, local_low_opens
import pytest
import pandas as pd


@pytest.mark.parametrize("test_input,expectedct,expectedlst",
                         [("Incrementum/tests/dataset1.csv", 3,
                           ["2025-10-20 09:30:00-04:00",
                            "2025-10-20 10:30:00-04:00",
                            "2025-10-20 13:00:00-04:00"]),
                          ("Incrementum/tests/dataset2.csv", 2,
                           ["2025-10-20 00:00:00-04:00",
                            "2025-10-29 00:00:00-04:00"]),
                          ("Incrementum/tests/dataset3.csv", 3,
                           ["2025-11-18 09:30:00-05:00",
                            "2025-11-18 09:34:00-05:00"])])
def test_high(test_input, expectedct, expectedlst):
    data = pd.read_csv(test_input)
    print(local_high_opens(data))
    print(expectedlst)
    # assert len(local_high_opens(data)) == expectedct
    assert local_high_opens(data) == expectedlst


@pytest.mark.parametrize("test_input,expectedct,expectedlst",
                         [("Incrementum/tests/dataset1.csv", 2,
                           ["2025-10-20 10:00:00-04:00",
                            "2025-10-20 12:00:00-04:00"]),
                          ("Incrementum/tests/dataset2.csv", 1,
                           ["2025-10-23 00:00:00-04:00"]),
                          ("Incrementum/tests/dataset3.csv", 2,
                           ["2025-11-18 09:32:00-05:00",
                            "2025-11-18 09:37:00-05:00"]
                           )])
def test_low(test_input, expectedct, expectedlst):
    data = pd.read_csv(test_input)
    print(local_low_opens(data))
    print(expectedlst)
    # assert len(local_high_opens(data)) == expectedct
    assert local_low_opens(data) == expectedlst
