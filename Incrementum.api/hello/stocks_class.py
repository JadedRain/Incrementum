class Stock:
    def __init__(self, json):
        self.country = json['country'] ?? None
        self.currentPrice = json['currentPrice'] ?? None
        self.dayHigh = json['dayHigh'] ?? None
        self.dayLow = json['dayLow'] ?? None
        self.exchange = json['exchange'] ?? None
        self.displayName = json['displayName'] ?? None
        self.fiftyDayAverage = json['fiftyDayAverage'] ?? None
        self.fullExchangeName = json['fullExchangeName'] ?? None
        self.industry = json['industry'] ?? None
        self.industryKey = json['industryKey'] ?? None
        self.longName = json['longName'] ?? None
        self.open = json['open'] ?? None
        self.previousClose = json['previousClose'] ?? None
        self.shortName = json['shortName'] ?? None
        self.symbol = json['symbol'] ?? None
        self.sector = json['sector'] ?? None
        self.sectorKey = json['sectorKey'] ?? None
    

