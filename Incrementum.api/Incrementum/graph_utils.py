import matplotlib.pyplot as plt
import io
import logging
import yfinance as yf


def generate_overlay_graph(tokens, period="1y"):
    logger = logging.getLogger("django")
    if not tokens:
        return None, "No stocks in collection"
    plt.figure(figsize=(10, 6))
    found = False
    for ticker in tokens:
        try:
            stock = yf.Ticker(ticker)
            history = stock.history(period=period)
            if history is not None and not history.empty:
                plt.plot(history.index, history["Close"], label=ticker)
                found = True
            else:
                logger.warning(f"No history for ticker {ticker}")
        except Exception as e:
            logger.error(f"Error fetching data for {ticker}: {str(e)}")
    if not found:
        return None, "No valid stock data found"
    plt.xlabel("Date")
    plt.ylabel("Close Price")
    plt.title("Custom Collection: Overlay of Stock Prices")
    plt.legend()
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format="png")
    plt.close()
    buf.seek(0)
    return buf.getvalue(), None
