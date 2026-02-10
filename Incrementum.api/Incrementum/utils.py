from django.utils import timezone
from Incrementum.stock_history_service import StockHistoryService
from logging import Logger

logger = Logger("logs")


def calculate_percent_change(ticker: str, mode: str = 'day'):
    shs = StockHistoryService()
    now = timezone.now()

    if mode == 'day':
        df, _ = shs.history(ticker, period='2d', interval='1d')
        if df is None or len(df) < 2:
            return None, now
        old_time, new_time = df.index[-2], df.index[-1]
        old, new = df['Close'].iloc[-2], df['Close'].iloc[-1]
        logger.error(f"[PercentChange] DAY: old=({old_time}, {old}), new=({new_time}, {new})")

    elif mode == 'hour':
        df, _ = shs.history(ticker, period='2d', interval='1h')
        if df is None or len(df) < 2:
            return None, now
        old_time, new_time = df.index[-2], df.index[-1]
        old, new = df['Close'].iloc[-2], df['Close'].iloc[-1]
        logger.error(f"[PercentChange] HOUR: old=({old_time}, {old}), new=({new_time}, {new})")
    else:
        raise ValueError("mode must be 'day' or 'hour'")
    if old == 0 or old is None or new is None:
        return None, now
    percent_change = (new - old) / old
    return percent_change, now
