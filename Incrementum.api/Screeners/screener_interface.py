from abc import ABC, abstractmethod
from typing import List
from hello.stocks_class import Stock
class IScreener(ABC):
    @abstractmethod
    def screen(self, stocks: List[Stock]) -> List[Stock]:
        pass
    
