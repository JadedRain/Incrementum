from typing import List
from Incrementum.stocks_class import Stock
from .screener_interface import IScreener

class fifty_two_high(IScreener):
    def __init__(self, min_value=None, max_value=None):
        if min_value is None or (isinstance(min_value, str) and min_value.strip() == ""):
            self.min_value = 0
        else:
            try:
                self.min_value = float(min_value)
            except Exception:
                raise ValueError(f"min_value must be numeric or empty; got: {min_value!r}")

        if max_value is None or (isinstance(max_value, str) and max_value.strip() == ""):
            self.max_value = None
        else:
            try:
                self.max_value = float(max_value)
            except Exception:
                raise ValueError(f"max_value must be numeric or None; got: {max_value!r}")

    def screen(self, stocks: List[Stock]) -> List[Stock]:
        result = []
        for stock in stocks:
            if stock.price_52w_high is None:
                continue  # skip incomplete data

            high = stock.price_52w_high
            
            min_val = getattr(self, 'min_value', getattr(self, 'value', 0))
            max_val = getattr(self, 'max_value', None)

            if max_val is not None:
                if high < min_val or high > max_val:
                    continue
            else:
                if high < min_val:
                    continue

            result.append(stock)

        return result

class fifty_two_low(IScreener):
    def __init__(self, min_value=None, max_value=None):
        if min_value is None or (isinstance(min_value, str) and min_value.strip() == ""):
            self.min_value = 0
        else:
            try:
                self.min_value = float(min_value)
            except Exception:
                raise ValueError(f"min_value must be numeric or empty; got: {min_value!r}")

        if max_value is None or (isinstance(max_value, str) and max_value.strip() == ""):
            self.max_value = None
        else:
            try:
                self.max_value = float(max_value)
            except Exception:
                raise ValueError(f"max_value must be numeric or None; got: {max_value!r}")

    def screen(self, stocks: List[Stock]) -> List[Stock]:
        result = []
        for stock in stocks:
            if stock.price_52w_low is None:
                continue  # skip incomplete data

            low = stock.price_52w_low
            
            min_val = getattr(self, 'min_value', getattr(self, 'value', 0))
            max_val = getattr(self, 'max_value', None)

            if max_val is not None:
                if low < min_val or low > max_val:
                    continue
            else:
                if low < min_val:
                    continue

            result.append(stock)

        return result

