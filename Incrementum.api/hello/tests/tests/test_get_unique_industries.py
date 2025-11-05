from hello.utils import get_unique_sectors, get_unique_industries

def test_get_unique_sectors():
    sectors = get_unique_sectors()
    assert isinstance(sectors, list)
    assert "Technology" in sectors
    assert "Healthcare" in sectors
def test_get_unique_industries():
    industries = get_unique_industries(["Technology"])
    assert "Communication Equipment" in industries["Technology"]