from Incrementum.DTOs.ifilterdata import FilterData
from Screeners.screener_constructor import ScreenerConstructor
from Incrementum.stocks_class import Stock

class StockGetter:
    def get_stocks(self, filters: FilterData) -> list[Stock]:
        builder = ScreenerConstructor(filters)
        return builder.apply_screening()
    