from Incrementum.DTOs.ifilterdata import FilterData
from Screeners.screener_constructor import ScreenerConstructor
from Incrementum.stocks_class import Stock

class StockGetter:
    def __init__(self):
        self.value = None
        self.bool = None
    def addsort(self, sortValue: str, sortBool: bool):
        self.value = sortValue
        self.bool = sortBool
    def get_stocks(self, filters: FilterData) -> list[Stock]:
        builder = ScreenerConstructor(filters, self.value, self.bool)
        return builder.apply_screening()
    