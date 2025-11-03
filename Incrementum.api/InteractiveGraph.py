from dash import Dash, html, dcc, callback, Output, Input
import plotly.express as px
import pandas as pd
import requests
from urllib.parse import parse_qs

def _detect_api_base():
    candidates = [
        "http://api:8000",            # service name inside docker-compose network
        "http://incrementum_api:8000",# container name
        "http://localhost:8000",      # when running locally
    ]
    for c in candidates:
        try:
            requests.head(c, timeout=1)
            return c
        except Exception:
            continue
    # fallback to localhost
    return "http://localhost:8000"


API_BASE = _detect_api_base()

app = Dash()

app.layout = html.Div([
    dcc.Location(id="url", refresh=False),
    html.H1("Interactive Stock Chart", style={"textAlign": "center"}),
    html.Div([
        html.Label("Ticker:"),
        dcc.Input(id="ticker-input", type="text", placeholder="e.g. AAPL", value=""),
        html.Label("Period:" , style={"marginLeft":"12px"}),
        dcc.Dropdown(id="period-dropdown", options=[
            {"label": "1 month", "value": "1mo"},
            {"label": "6 months", "value": "6mo"},
            {"label": "1 year", "value": "1y"},
            {"label": "5 years", "value": "5y"},
        ], value="1y", clearable=False, style={"width":"150px", "display":"inline-block", "marginLeft":"8px"}),
        html.Label("Interval:", style={"marginLeft":"12px"}),
        dcc.Dropdown(id="interval-dropdown", options=[
            {"label": "1 day", "value": "1d"},
            {"label": "1 week", "value": "1wk"},
        ], value="1d", clearable=False, style={"width":"120px", "display":"inline-block", "marginLeft":"8px"}),
    ], style={"display": "flex", "alignItems": "center", "gap": "8px", "justifyContent": "center"}),
    dcc.Graph(id="graph-content"),
])


@callback(Output("ticker-input", "value"), Input("url", "search"))
def set_ticker_from_search(search):
    # read ?ticker=... from iframe query string and populate input
    if not search:
        return ""
    qs = parse_qs(search.lstrip("?"))
    return qs.get("ticker", [""])[0]


@callback(
    Output("graph-content", "figure"),
    Input("ticker-input", "value"),
    Input("period-dropdown", "value"),
    Input("interval-dropdown", "value"),
)
def update_graph(ticker, period, interval):
    # If no ticker provided, show empty figure
    if not ticker:
        return px.line(pd.DataFrame({"x": [], "y": []}), x="x", y="y").update_layout(title="No ticker provided")

    try:
        url = f"{API_BASE}/getStocks/{ticker}/"
        params = {"period": period, "interval": interval, "format": "json"}
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        # expecting keys: dates (ISO strings) and close (numbers)
        dates = pd.to_datetime(data.get("dates", []))
        close = data.get("close", [])
        df = pd.DataFrame({"date": dates, "close": close})
        if df.empty:
            return px.line(df, x="date", y="close").update_layout(title=f"No data for {ticker}")
        fig = px.line(df, x="date", y="close", title=f"{ticker} Closing Prices")
        fig.update_layout(xaxis_title="Date", yaxis_title="Price ($)")
        return fig
    except Exception as e:
        # return a simple figure with the error message as the title so the iframe shows something useful
        return px.line(pd.DataFrame({"x": [], "y": []}), x="x", y="y").update_layout(title=f"Error: {e}")


if __name__ == "__main__":
    # listen on all interfaces so the container port is reachable from host
    app.run(host="0.0.0.0", port=8050, debug=True)