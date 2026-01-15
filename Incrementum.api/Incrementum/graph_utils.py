import matplotlib.pyplot as plt
import mplfinance as mpf
import io
import logging
from .stock_history_service import StockHistoryService


def generate_overlay_graph(tokens, period="1y"):
    logger = logging.getLogger("django")
    if not tokens:
        return None, None, "No stocks in collection"

    history_service = StockHistoryService()
    plt.figure(figsize=(10, 6))
    found = False
    for ticker in tokens:
        try:
            history, metadata = history_service.history(ticker, period=period)
            if history is not None and not history.empty:
                plt.plot(history.index, history["Close"], label=ticker)
                found = True
            else:
                logger.warning(f"No history for ticker {ticker}")
        except Exception as e:
            logger.error(f"Error fetching data for {ticker}: {str(e)}")
    if not found:
        return None, None, "No valid stock data found"
    plt.xlabel("Date")
    plt.ylabel("Close Price")
    plt.title("Custom Collection: Overlay of Stock Prices")
    plt.legend()
    buf_line = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf_line, format="png")
    plt.close()
    buf_line.seek(0)

    # Candlestick chart for the first ticker (or all, but here just the first for clarity)
    buf_candle = io.BytesIO()
    candle_found = False
    for ticker in tokens:
        try:
            history, metadata = history_service.history(ticker, period=period)
            if history is not None and not history.empty:
                mpf.plot(
                    history,
                    type='candle',
                    style='charles',
                    title=f"Candlestick: {ticker}",
                    ylabel='Price',
                    savefig=buf_candle
                )
                candle_found = True
                break
        except Exception as e:
            logger.error(f"Error generating candlestick for {ticker}: {str(e)}")
    if not candle_found:
        buf_candle = None

    # Return both images as bytes
    return buf_line.getvalue(), buf_candle.getvalue() if buf_candle else None, None
