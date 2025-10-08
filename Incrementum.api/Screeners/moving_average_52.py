from typing import List
from .stock import Stock
from .screener_interface import IScreener
class MovingAverage52Weeks(IScreener):
    def __init__(self, period: int = 52):
        self.period = period

    def screen(self, stocks: List[Stock]) -> List[Stock]:
        result = []
        for stock in stocks:
            if len(stock.close_prices) < self.period:
                continue
            ma = sum(stock.close_prices[-self.period:]) / self.period
            if stock.close_prices[-1] > ma:
                result.append(stock)
        return result
