from Incrementum.DTOs.ifilterdata import FilterData
from Incrementum.stocks_class import Stock
from yfinance import EquityQuery
from yfinance import screen
from Screeners.moving_average_52 import fifty_two_high, fifty_two_low
from Screeners.numeric_screeners import NumericScreeners

class ScreenerConstructor:
    def __init__(self, filters: list[FilterData], Eq = EquityQuery):
        self.EquityQuery = Eq
        self.screeners = []  # Screener classes to apply after yfinance
        
        yfinance_filters = []
        for f in filters:
            if f.operand == 'lastclose52weekhigh.lasttwelvemonths':
                if f.operator in ['gt', 'gte']:
                    self.screeners.append(fifty_two_high(min_value=f.value, max_value=None))
                elif f.operator in ['lt', 'lte']:
                    self.screeners.append(fifty_two_high(min_value=0, max_value=f.value))
                elif f.operator == 'eq':
                    self.screeners.append(fifty_two_high(min_value=f.value, max_value=f.value))
                elif f.operator == 'btwn':
                    self.screeners.append(fifty_two_high(min_value=f.value[0], max_value=f.value[1]))
            elif f.operand == 'lastclose52weeklow.lasttwelvemonths':
                # Create fifty_two_low screener
                if f.operator in ['gt', 'gte']:
                    self.screeners.append(fifty_two_low(min_value=f.value, max_value=None))
                elif f.operator in ['lt', 'lte']:
                    self.screeners.append(fifty_two_low(min_value=0, max_value=f.value))
                elif f.operator == 'eq':
                    self.screeners.append(fifty_two_low(min_value=f.value, max_value=f.value))
                elif f.operator == 'btwn':
                    self.screeners.append(fifty_two_low(min_value=f.value[0], max_value=f.value[1]))
            else:
                yfinance_filters.append(f)
        
        self.filters_numeric = [self.factor_numeric(f) for f in yfinance_filters if f.filter_type == 'numeric']
        self.filters_categorical = {}
        for f in yfinance_filters:
            if f.filter_type == 'categoric':
                if f.operand in self.filters_categorical:
                    self.filters_categorical[f.operand].append(self.factor_categorical(f))
                else:   
                    self.filters_categorical[f.operand] = [self.factor_categorical(f)]
        
    def factor_numeric(self, data: FilterData) -> any:
        if data.filter_type != 'numeric':
            raise ValueError("Invalid filter type for numeric factorization")
        if data.operator == 'btwn':
            return self.EquityQuery(data.operator, [data.operand, data.value[0], data.value[1]])
        return self.EquityQuery(data.operator, [data.operand, data.value])

    def factor_categorical(self, data: FilterData) -> any:
        if data.filter_type != 'categoric':
            raise ValueError("Invalid filter type for categorical factorization")
        return self.EquityQuery(data.operator, [data.operand, data.value])

    def apply_screening(self) -> list[Stock]:
        categoric = [self.EquityQuery('or', v) if len(v) > 1 else v[0] for v in self.filters_categorical.values()]
        
        # Always add US region filter
        region_filter = self.EquityQuery('eq', ['region', 'us'])
        
        # Handle empty filters case
        if not categoric and not self.filters_numeric:
            result = screen(region_filter, size=250)
        else:
            # Combine all filters with the region filter
            all_filters = categoric + self.filters_numeric + [region_filter]
            result = screen(self.EquityQuery('and', all_filters), size=250)
        
        # Convert yfinance response to Stock objects
        if isinstance(result, dict) and 'quotes' in result:
            stocks = []
            for quote in result['quotes']:
                # Map yfinance field names to Stock class
                stock_data = quote.copy()
                stock_data['price_52w_high'] = quote.get('fiftyTwoWeekHigh')
                stock_data['price_52w_low'] = quote.get('fiftyTwoWeekLow')
                stock_data['currentPrice'] = quote.get('regularMarketPrice')
                stocks.append(Stock(stock_data))
            
            # Apply screener classes for 52-week high/low filtering
            if self.screeners:
                numeric_screeners = NumericScreeners(self.screeners)
                stocks = numeric_screeners.apply_screenings(stocks)
            
            return stocks
        return []
        if not self.filters_numeric:
            return screen(self.EquityQuery("and", categoric) if len(categoric) > 1 else categoric[0], offset=0, size=250)
        both = categoric + self.filters_numeric
        return screen(self.EquityQuery('and', self.filters_numeric + categoric) if len(both) > 1 else both[0], offset=0, size=250)
