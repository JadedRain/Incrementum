from .stock import Stock
from typing import List
from .screener_interface import IScreener

class NumericScreeners:
    def __init__(self, screeners: List[IScreener] = None):
        self.screeners = screeners or []

    def add_screener(self, screener: IScreener):
        self.screeners.append(screener)

    def apply_screenings(self, stocks: List[Stock]) -> List[Stock]:
        filtered_stocks = stocks
        for screener in self.screeners:
            filtered_stocks = screener.screen(filtered_stocks)
        return filtered_stocks
