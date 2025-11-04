class Stock:
    def __init__(self, json):
        self.symbol = json.get('symbol')
        self.longName = json.get('longName')
        self.shortName = json.get('shortName')
        self.displayName = json.get('displayName')
        self.exchange = json.get('exchange')
        self.fullExchangeName = json.get('fullExchangeName')
        self.country = json.get('country')
        self.industry = json.get('industry')
        self.industryKey = json.get('industryKey')
        self.sector = json.get('sector')
        self.sectorKey = json.get('sectorKey')
        self.open = json.get('open')
        self.previousClose = json.get('previousClose')
        self.currentPrice = json.get('currentPrice')
        self.dayHigh = json.get('dayHigh')
        self.dayLow = json.get('dayLow')
        self.fiftyDayAverage = json.get('fiftyDayAverage')
        self.price_52w_high = json.get('price_52w_high')
        self.regularMarketChangePercent = json.get('regularMarketChangePercent')
        

    def to_dict(self):
        return self.__dict__
    

