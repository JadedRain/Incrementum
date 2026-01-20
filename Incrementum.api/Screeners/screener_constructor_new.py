from Incrementum.DTOs.ifilterdata import FilterData
from Incrementum.stocks_class import Stock
from Incrementum.services.custom_collection_service import CustomCollectionService

class NewScreenerConstructor:
    def __init__(
        self,
        filters: list[FilterData],
        value: str = None,
        bool: bool = None,
        Eq = None
    ):
        self.filters = filters
        self.value = value
        self.bool = bool
        self.numeric_filters = []
        self.categorical_filters = []
        self.collection_filter = None
        

    def factor_numeric(self, data: FilterData) -> any:
        if data.filter_type != 'numeric':
            raise ValueError(f"Expected numeric filter, got {data.filter_type}")
        return {
            'operator': data.operator,
            'operand': data.operand,
            'value': data.value
        }

    def factor_categorical(self, data: FilterData) -> any:
        if data.filter_type != 'categorical':
            raise ValueError(f"Expected categorical filter, got {data.filter_type}")
        return {
            'operator': data.operator,
            'operand': data.operand,
            'value': data.value
        }
    def factor_collection(self, data: list[FilterData]) -> list[any]:
        self.numeric_filters = [self.factor_numeric(d) for d in data if d.filter_type == 'numeric']
        self.categorical_filters = [self.factor_categorical(d) for d in data if d.filter_type == 'categorical']
        collection_filter = data.first(lambda d: d.filter_type == 'custom_collection')
        self.collection_filter = {"collection_id": collection_filter.value} if collection_filter else None
        return self.numeric_filters + self.categorical_filters
    
    def apply_numeric_filter(self, stocks: list[Stock], nf: dict) -> list[Stock]:
        operator = nf['operator']
        operand = nf['operand']
        value = nf['value']
        if operator == 'greater_than':
            return [s for s in stocks if getattr(s, operand) > value]
        elif operator == 'less_than':
            return [s for s in stocks if getattr(s, operand) < value]
        elif operator == 'equal_to':
            return [s for s in stocks if getattr(s, operand) == value]
        return stocks
    def apply_categoric_filter(self, stocks: list[Stock], cf: dict) -> list[Stock]:
        operator = cf['operator']
        operand = cf['operand']
        value = cf['value']
        if operator == 'equals':
            return [s for s in stocks if getattr(s, operand) == value]
        elif operator == 'not_equals':
            return [s for s in stocks if getattr(s, operand) != value]
        return stocks
    def apply_screening(self) -> list[Stock]:
        stocks = []
        if self.collection_filter:
            collection_service = CustomCollectionService()
            stocks = collection_service.get_stocks_in_collection(self.collection_filter['collection_id'])
        else:
            stocks = Stock.objects.all()  
        for nf in self.numeric_filters:
            stocks = self.apply_numeric_filter(stocks, nf)
        for cf in self.categorical_filters:
            stocks = self.apply_categoric_filter(stocks, cf)
        return stocks