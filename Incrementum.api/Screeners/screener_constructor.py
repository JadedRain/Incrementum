from Incrementum.DTOs.ifilterdata import FilterData
from Incrementum.stocks_class import Stock
from yfinance import EquityQuery

class ScreenerConstructor:
    def __init__(self, filters: list[FilterData], Eq = EquityQuery):
        self.EquityQuery = Eq
        self.filters = [self.factor_categorical(f) for f in filters if f.filter_type == 'categorical'] + [self.factor_numeric(f) for f in filters if f.filter_type == 'numeric']
        # self.query = EquityQuery()
        
    def factor_numeric(self, data: FilterData) -> any:
        if data.filter_type != 'numeric':
            raise ValueError("Invalid filter type for numeric factorization")
        if data.operator == 'btwn':
            # Use injected class for consistency
            return self.EquityQuery(data.operator, [data.operand, data.value[0], data.value[1]])
        return self.EquityQuery(data.operator, [data.operand, data.value])

    def factor_categorical(self, data: FilterData) -> any:
        if data.filter_type != 'categorical':
            raise ValueError("Invalid filter type for categorical factorization")
        return self.EquityQuery(data.operator, [data.operand, data.value])

    def apply_screening(self) -> list[Stock]:
        return self.EquityQuery('and', self.filters).get_stocks() if self.filters else []