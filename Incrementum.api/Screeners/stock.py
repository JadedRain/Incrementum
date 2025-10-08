from typing import List

class Stock:
    def __init__(self, symbol: str, pe: float = None, market_cap: float = None, close_prices: List[float] = None):
        self.symbol = symbol
        self.pe = pe
        self.market_cap = market_cap
        self.close_prices = close_prices or []

    def __repr__(self):
        return f"<Stock {self.symbol}>"
