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
        self.price_52w_low = json.get('price_52w_low')
        self.regularMarketChangePercent = json.get('regularMarketChangePercent')
        self.marketCap = json.get('marketCap')
        self.volume = json.get('volume') or json.get('regularMarketVolume')
        self.averageVolume = (
            json.get('averageVolume')
            or json.get('averageDailyVolume3Month')
            or json.get('avgDailyVolume3Month')
        )

        # Frontend expects these field names
        self.regularMarketPrice = json.get('regularMarketPrice')
        self.fiftyTwoWeekHigh = json.get('fiftyTwoWeekHigh')
        self.fiftyTwoWeekLow = json.get('fiftyTwoWeekLow')
        self.regularMarketVolume = json.get('regularMarketVolume')
        self.averageDailyVolume3Month = json.get('averageDailyVolume3Month')

    def to_dict(self):
        return self.__dict__
