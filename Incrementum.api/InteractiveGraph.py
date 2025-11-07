from dash import Dash, html, dcc, callback, Output, Input, State
import plotly.express as px
import pandas as pd
import requests
from urllib.parse import parse_qs
import json

API_BASE = 'http://api:8000'

def fetch_data_from_api():
     api_url = f"{API_BASE}/getStocks/"
     
     try:
         response = requests.get(api_url)
         response.raise_for_status()
         data = response.json()
         return html.Pre(json.dumps(data, indent=2))
     except requests.exceptions.RequestException as e:
         return f"Error fetching data: {e}"
     
app = Dash()

app.layout = html.Div([
    html.Div([
        dcc.Location(id="url", refresh=False),
        dcc.Input(id="ticker-input", type="text", value="", style={"display": "none"}),
        html.Div(
            [
                html.Div(
                    [
                        html.H1(id="ticker-title", children="TICKER", style={"fontSize": "36px", "fontWeight": "700", "margin": 0}),
                        html.Div(id="price-display", children="", style={"fontSize": "24px", "marginTop": "6px"}),
                    ],
                    style={"textAlign": "left", "padding": "6px 10px", "marginRight": "auto"},
                ),
               dcc.Tabs(
                    id="period-tabs",
                    value="ytd",
                    persistence=True,
                    style={"borderBottom": "1px solid rgba(0,0,0,0.06)", "paddingBottom": "6px", "backgroundColor": "transparent"},
                    children=[
                        dcc.Tab(label="1D", value="1d", style={"padding":"2px 6px","fontSize":"11px","color":"#251C09","border":"none","minWidth":"28px","lineHeight":"1","textAlign":"center"}, selected_style={"color":"#16A34A","border":"none","borderBottom":"2px solid #16A34A","fontWeight":"600"}),
                        dcc.Tab(label="1W", value="1wk", style={"padding":"4px 8px","fontSize":"12px","color":"#251C09","border":"none","minWidth":"34px","textAlign":"center"}, selected_style={"color":"#16A34A","border":"none","borderBottom":"3px solid #16A34A","fontWeight":"600"}),
                        dcc.Tab(label="1M", value="1mo", style={"padding":"4px 8px","fontSize":"12px","color":"#251C09","border":"none","minWidth":"34px","textAlign":"center"}, selected_style={"color":"#16A34A","border":"none","borderBottom":"3px solid #16A34A","fontWeight":"600"}),
                        dcc.Tab(label="3M", value="3mo", style={"padding":"4px 8px","fontSize":"12px","color":"#251C09","border":"none","minWidth":"34px","textAlign":"center"}, selected_style={"color":"#16A34A","border":"none","borderBottom":"3px solid #16A34A","fontWeight":"600"}),
                        dcc.Tab(label="YTD", value="ytd", style={"padding":"4px 8px","fontSize":"12px","color":"#251C09","border":"none","minWidth":"34px","textAlign":"center"}, selected_style={"color":"#16A34A","border":"none","borderBottom":"3px solid #16A34A","fontWeight":"600"}),
                        dcc.Tab(label="1Y", value="1Y", style={"padding":"4px 8px","fontSize":"12px","color":"#251C09","border":"none","minWidth":"34px","textAlign":"center"}, selected_style={"color":"#16A34A","border":"none","borderBottom":"3px solid #16A34A","fontWeight":"600"})
                    ],
                ),
                dcc.Input(id="interval-dropdown", type="hidden", value="1d"),
            ],
            style={"display": "flex", "alignItems": "center", "gap": "8px", "justifyContent": "flex-start", "paddingRight": "32px", "marginLeft":"12px"},
        ),
        dcc.Graph(id="graph-content", config={"displayModeBar": False}, style={"width": "100%"}),
    ], style={"marginLeft": "250px", "width": "calc(100% - 250px)"}),
], style={
    "backgroundColor": "#DCB465",
    "color": "#251C09",
    "minHeight": "100vh",
    "paddingTop": "12px"
})


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
    Input("period-tabs", "value"),
    Input("interval-dropdown", "value"),
)
def update_graph(ticker, period, interval):
    if not ticker:
        return px.line(pd.DataFrame({"x": [], "y": []}), x="x", y="y").update_layout(title="No ticker provided")

    try:
        intervals_to_try = [interval]
        if (period or "").lower() == "1d" and interval not in ("1h", "60m", "30m", "15m"):
            intervals_to_try = ["1h", "60m", "30m", "15m", "5m", interval]

        data = None
        for itv in intervals_to_try:
            try:
                url = f"{API_BASE}/getStocks/{ticker}/"
                params = {"period": period, "interval": itv, "format": "json"}
                resp = requests.get(url, params=params, timeout=10)
                resp.raise_for_status()
                candidate = resp.json()
                close = candidate.get("close", []) or []
                if len(close) >= 2:
                    data = candidate
                    break
            except Exception:
                continue

        if data is None:
            try:
                url = f"{API_BASE}/getStocks/{ticker}/"
                params = {"period": period, "interval": interval, "format": "json"}
                resp = requests.get(url, params=params, timeout=10)
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                return px.line(pd.DataFrame({"x": [], "y": []}), x="x", y="y").update_layout(title=f"Error: {e}")

        dates = pd.to_datetime(data.get("dates", []))
        close = data.get("close", []) or []
        df = pd.DataFrame({"date": dates, "close": close})
        if df.empty:
            return px.line(df, x="date", y="close").update_layout(title=f"No data for {ticker}")
        # show axis titles and tick labels so the user can see Date and Price
        fig = px.line(df, x="date", y="close", color_discrete_sequence=["#251C09"], labels={"date": "Date", "close": "Price"})
        fig.update_layout(
            xaxis=dict(showticklabels=True, showgrid=False, zeroline=False, showline=True, title="Date", tickfont={"color": "#251C09"}),
            yaxis=dict(showticklabels=True, showgrid=False, zeroline=False, showline=True, title="Price $", tickfont={"color": "#251C09"}),
            paper_bgcolor="#DCB465",
            plot_bgcolor="#DCB465",
            font_color="#251C09"
        )
        if fig.data:
            fig.data[0].update(hovertemplate="$%{y:.2f}<extra></extra>")
        return fig
    except Exception as e:
        return px.line(pd.DataFrame({"x": [], "y": []}), x="x", y="y").update_layout(title=f"Error: {e}")

@callback(
    Output("price-display", "children"),
    Input("graph-content", "hoverData"),
    Input("graph-content", "figure"),
    Input("ticker-input", "value"),
    Input("period-tabs", "value"),
    Input("interval-dropdown", "value"),
)
def update_price_display(hoverData, figure, ticker, period, interval):
    if hoverData and "points" in hoverData and len(hoverData["points"]) > 0:
        y = hoverData["points"][0].get("y")
        try:
            return f"${float(y):,.2f}"
        except Exception:
            return str(y)

    if figure and "data" in figure and len(figure["data"]) > 0:
        intervals_to_try = [interval]
        if (period or "").lower() == "1d" and interval not in ("1h", "60m", "30m", "15m"):
            intervals_to_try = ["1h", "60m", "30m", "15m", "5m", interval]
        for itv in intervals_to_try:
            try:
                url = f"{API_BASE}/getStocks/{ticker}/"
                params = {"period": period or "1y", "interval": itv, "format": "json"}
                resp = requests.get(url, params=params, timeout=6)
                resp.raise_for_status()
                data = resp.json()
                close = data.get("close", []) or []
                if close:
                    last = close[-1]
                    return f"${float(last):,.2f}"
            except Exception:
                continue
    return ""

@callback(Output("ticker-title", "children"), Input("ticker-input", "value"))
def update_title_from_input(ticker_value):
    # show the ticker or fallback text; format as you like
    return (ticker_value or "TICKER").upper()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8050, debug=False)