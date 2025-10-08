from typing import List
from hello.stocks_class import Stock
from .screener_interface import IScreener
class fifty_two_high(IScreener):
    def __init__(self, value):
        self.value = value

    def screen(self, stocks: List[Stock]) -> List[Stock]:
        result = []
        for stock in stocks:
            if stock.price_52w_high is None:
                continue  # skip incomplete data
            if stock.price_52w_high < self.value:
                continue
            result.append(stock)
        return result
