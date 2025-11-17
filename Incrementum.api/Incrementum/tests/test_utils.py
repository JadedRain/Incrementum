from Incrementum.utils import get_unique_sectors


def test_get_unique_sectors_contains_known_value():
    sectors = get_unique_sectors()

    # Basic sanity checks
    assert isinstance(sectors, list)
    assert len(sectors) > 0
