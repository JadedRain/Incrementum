from Incrementum.DTOs.ifilterdata import FilterData
from Incrementum.stocks_class import Stock
from yfinance import EquityQuery
from yfinance import screen

class ScreenerConstructor:
    def __init__(self, filters: list[FilterData], Eq = EquityQuery):
        self.EquityQuery = Eq
        self.filters_numeric =  [self.factor_numeric(f) for f in filters if f.filter_type == 'numeric']
        self.filters_categorical = {}
        for f in filters:
            if f.filter_type == 'categoric':
                if f.operand in self.filters_categorical:
                    self.filters_categorical[f.operand].append(self.factor_categorical(f))
                else:   
                    self.filters_categorical[f.operand] = [self.factor_categorical(f)]
        # self.query = EquityQuery()
        
    def factor_numeric(self, data: FilterData) -> any:
        if data.filter_type != 'numeric':
            raise ValueError("Invalid filter type for numeric factorization")
        if data.operator == 'btwn':
            # Use injected class for consistency
            return self.EquityQuery(data.operator, [data.operand, data.value[0], data.value[1]])
        return self.EquityQuery(data.operator, [data.operand, data.value])

    def factor_categorical(self, data: FilterData) -> any:
        if data.filter_type != 'categoric':
            raise ValueError("Invalid filter type for categorical factorization")
        return self.EquityQuery(data.operator, [data.operand, data.value])

    def apply_screening(self) -> list[Stock]:
        categoric = [self.EquityQuery('or', v) if len(v) > 1 else v[0] for v in self.filters_categorical.values()]
        if not self.filters_numeric:
            return screen(self.EquityQuery("and", categoric) if len(categoric) > 1 else categoric[0])
        both = categoric + self.filters_numeric
        return screen(self.EquityQuery('and', self.filters_numeric + categoric) if len(both) > 1 else both[0])