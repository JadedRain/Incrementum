class Stock:
    def __init__(self, json):
        self.country = json.get('country')
        self.currentPrice = json.get('currentPrice')
        self.dayHigh = json.get('dayHigh')
        self.dayLow = json.get('dayLow')
        self.exchange = json.get('exchange')
        self.displayName = json.get('displayName')
        self.fiftyDayAverage = json.get('fiftyDayAverage')
        self.fullExchangeName = json.get('fullExchangeName')
        self.industry = json.get('industry')
        self.industryKey = json.get('industryKey')
        self.longName = json.get('longName')
        self.open = json.get('open')
        self.previousClose = json.get('previousClose')
        self.shortName = json.get('shortName')
        self.symbol = json.get('symbol')
        self.sector = json.get('sector')
        self.sectorKey = json.get('sectorKey')
        self.regularMarketChangePercent = json.get('regularMarketChangePercent')

    def to_dict(self):
        return self.__dict__
    

