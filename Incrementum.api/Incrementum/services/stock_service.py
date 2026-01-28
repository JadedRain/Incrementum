from Incrementum.models import Stock

class StockService:
    @staticmethod
    def get_stock_by_symbol(symbol):
        try:
            return Stock.objects.get(symbol=symbol)
        except Stock.DoesNotExist:
            return None

    @staticmethod
    def get_stocks_by_symbols(symbols):
        return list(Stock.objects.filter(symbol__in=symbols))
