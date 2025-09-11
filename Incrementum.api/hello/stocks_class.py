class stock:
    __init__(self, json):
    self.country = json['country']
    self.currentPrice = json['currentPrice']
    self.dayHigh = json['dayHigh']
    self.dayLow = json['dayLow']
    self.exchange = json['exchange']
    self.displayName = json['displayName']
    self.fiftyDayAverage = json['fiftyDayAverage']
    self.fullExchangeName = json['fullExchangeName']
    self.industry = json['industry']
    self.industryKey = json['industryKey']
    self.longName = json['longName']
    self.open = json['open']
    self.previousClose = json['previousClose']
    self.shortName = json['shortName']
    self.symbol = json['symbol']
    self.sector = json['sector']
    self.sectorKey = json['sectorKey']
    

