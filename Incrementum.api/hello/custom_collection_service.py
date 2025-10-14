from typing import List
from .models import Stock

class CustomCollectionService:
    def __init__(self):
        self.tokens: List[str] = []
    def get_stocks(self) -> List[str]:
        return self.tokens
    def add_stock(self, token: str) -> None:
        if token not in self.tokens:
            self.tokens.append(token)
    def remove_stock(self, token: str) -> None:
        if token in self.tokens:
            self.tokens.remove(token)
    def aggregate_data(self):
        from .get_stock_info import fetch_stock_data
        stock_data = [fetch_stock_data(token) for token in self.tokens]
        # Example aggregate: sum market caps, average price, etc. Here, just collect info.
        aggregate = {}
        if stock_data:
            aggregate['count'] = len(stock_data)
            aggregate['symbols'] = [s.info.get('symbol') for s in stock_data if hasattr(s, 'info')]
            aggregate['names'] = [s.info.get('shortName') for s in stock_data if hasattr(s, 'info')]
            aggregate['marketCaps'] = [s.info.get('marketCap') for s in stock_data if hasattr(s, 'info')]
            aggregate['avgMarketCap'] = (sum([m for m in aggregate['marketCaps'] if m]) / len([m for m in aggregate['marketCaps'] if m])) if aggregate['marketCaps'] else None
        return {"tokens": self.tokens, "aggregate": aggregate}
