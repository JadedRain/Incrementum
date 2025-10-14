from hello.DTOs.ifilterdata import FilterData
from Screeners.screener_constructor import ScreenerConstructor
from hello.stocks_class import Stock

class StockGetter:
    def __init__(self, max = 250):
        self.max = max
    
    def get_stocks(self, filters: FilterData) -> list[Stock]:
        builder = ScreenerConstructor(filters)
        return builder.apply_screening()
    