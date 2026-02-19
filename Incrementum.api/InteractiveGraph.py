from dash import Dash, html, dcc, callback, Output, Input
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import requests
import logging
from urllib.parse import parse_qs
import json
from tokens import get_theme, DARK_THEME

API_BASE = 'http://api:8000'
logger = logging.getLogger("dash")


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
        dcc.Input(id="type-input", type="hidden", value="line"),
        dcc.Input(id="theme-input", type="hidden", value="dark"),
        html.Div(
            children=[
                html.Div(
                    [
                        html.H1(
                            id="ticker-title",
                            children="TICKER",
                            style={
                                "fontSize": "36px",
                                "fontWeight": "700",
                                "margin": 0,
                                "color": DARK_THEME["TEXT_SECONDARY"]
                            }
                        ),
                        html.Div(
                            id="price-display",
                            children="",
                            style={
                                "fontSize": "24px",
                                "marginTop": "6px",
                                "color": DARK_THEME["TEXT_PRIMARY"]
                            }
                        ),
                    ],
                    style={"textAlign": "left", "padding": "6px 10px", "marginRight": "auto"},
                ),
                dcc.Tabs(
                    id="period-tabs",
                    value="ytd",
                    persistence=True,
                    style={
                        "borderBottom": "1px solid rgba(0,0,0,0.06)",
                        "paddingBottom": "6px",
                        "backgroundColor": "transparent"
                    },
                    children=[
                        dcc.Tab(
                            label="1D",
                            value="1d",
                            style={
                                "padding": "2px 6px",
                                "fontSize": "11px",
                                "color": DARK_THEME["TEXT_PRIMARY"],
                                "border": "none",
                                "minWidth": "28px",
                                "lineHeight": "1",
                                "textAlign": "center"
                            },
                            selected_style={
                                "color": DARK_THEME["ACCENT"],
                                "border": "none",
                                "borderBottom": f"2px solid {DARK_THEME['ACCENT']}",
                                "fontWeight": "600"
                            }),
                        dcc.Tab(
                            label="1W",
                            value="1wk",
                            style={
                                "padding": "4px 8px",
                                "fontSize": "12px",
                                "color": DARK_THEME["TEXT_PRIMARY"],
                                "border": "none",
                                "minWidth": "34px",
                                "textAlign": "center"
                            },
                            selected_style={
                                "color": DARK_THEME["ACCENT"],
                                "border": "none",
                                "borderBottom": f"3px solid {DARK_THEME['ACCENT']}",
                                "fontWeight": "600"
                            }),
                        dcc.Tab(
                            label="1M",
                            value="1mo",
                            style={
                                "padding": "4px 8px",
                                "fontSize": "12px",
                                "color": DARK_THEME["TEXT_PRIMARY"],
                                "border": "none",
                                "minWidth": "34px",
                                "textAlign": "center"
                            },
                            selected_style={
                                "color": DARK_THEME["ACCENT"],
                                "border": "none",
                                "borderBottom": f"3px solid {DARK_THEME['ACCENT']}",
                                "fontWeight": "600"
                            }),
                        dcc.Tab(
                            label="3M",
                            value="3mo",
                            style={
                                "padding": "4px 8px",
                                "fontSize": "12px",
                                "color": DARK_THEME["TEXT_PRIMARY"],
                                "border": "none",
                                "minWidth": "34px",
                                "textAlign": "center"
                            },
                            selected_style={
                                "color": DARK_THEME["ACCENT"],
                                "border": "none",
                                "borderBottom": f"3px solid {DARK_THEME['ACCENT']}",
                                "fontWeight": "600"
                            }),
                        dcc.Tab(
                            label="YTD",
                            value="ytd",
                            style={
                                "padding": "4px 8px",
                                "fontSize": "12px",
                                "color": DARK_THEME["TEXT_PRIMARY"],
                                "border": "none",
                                "minWidth": "34px",
                                "textAlign": "center"
                            },
                            selected_style={
                                "color": DARK_THEME["ACCENT"],
                                "border": "none",
                                "borderBottom": f"3px solid {DARK_THEME['ACCENT']}",
                                "fontWeight": "600"
                            }),
                        dcc.Tab(
                            label="1Y",
                            value="1Y",
                            style={
                                "padding": "4px 8px",
                                "fontSize": "12px",
                                "color": DARK_THEME["TEXT_PRIMARY"],
                                "border": "none",
                                "minWidth": "34px",
                                "textAlign": "center"
                            },
                            selected_style={
                                "color": DARK_THEME["ACCENT"],
                                "border": "none",
                                "borderBottom": f"3px solid {DARK_THEME['ACCENT']}",
                                "fontWeight": "600"
                            })
                    ],
                ),
                dcc.Input(id="interval-dropdown", type="hidden", value="1d"),
            ],
            style={
                "display": "flex",
                "alignItems": "center",
                "gap": "8px",
                "justifyContent": "flex-start",
                "paddingRight": "32px",
                "marginLeft": "12px"
            },
        ),
        dcc.Graph(id="graph-content", config={"displayModeBar": False}, style={"width": "100%"}),
    ], id="main-content", style={"marginLeft": "250px", "width": "calc(100% - 250px)"}),
], id="root-container", style={
    "backgroundColor": DARK_THEME["BG_SURFACE"],
    "color": DARK_THEME["TEXT_SECONDARY"],
    "minHeight": "100vh",
    "paddingTop": "12px"
})


@callback(
    Output("ticker-input", "value"),
    Output("type-input", "value"),
    Output("theme-input", "value"),
    Input("url", "search")
)
def set_ticker_and_type_from_search(search):
    if not search:
        return "", "line", "dark"
    qs = parse_qs(search.lstrip("?"))
    ticker = qs.get("ticker", [""])[0]
    graph_type = qs.get("type", ["line"])[0]
    theme = qs.get("theme", ["dark"])[0]
    return ticker, graph_type, theme


@callback(
    Output("graph-content", "figure"),
    Input("ticker-input", "value"),
    Input("period-tabs", "value"),
    Input("interval-dropdown", "value"),
    Input("type-input", "value"),
    Input("theme-input", "value"),
)
def update_graph(ticker, period, interval, graph_type, theme):
    # Get theme colors
    colors = get_theme(theme)
    BG_SURFACE = colors["BG_SURFACE"]
    TEXT_PRIMARY = colors["TEXT_PRIMARY"]
    TEXT_SECONDARY = colors["TEXT_SECONDARY"]
    ACCENT = colors["ACCENT"]
    STATUS_ERROR = colors["STATUS_ERROR"]
    if not ticker:
        empty_df = pd.DataFrame({"x": [], "y": []})
        fig = px.line(empty_df, x="x", y="y")
        return fig.update_layout(title="No ticker provided")

    try:
        normalized_period = (period or "").lower()
        if normalized_period in ("3mo", "ytd", "1y"):
            interval = "1d"

        intervals_to_try = [interval]
        if normalized_period == "1d" and interval not in ("1h", "60m", "30m", "15m"):
            intervals_to_try = ["1h", "60m", "30m", "15m", "5m", interval]

        data = None
        for itv in intervals_to_try:
            try:
                url = f"{API_BASE}/getStocks/{ticker}/"
                params = {"period": period, "interval": itv, "format": "json"}
                resp = requests.get(url, params=params, timeout=10)
                resp.raise_for_status()
                candidate = resp.json()
                close = candidate.get("close", []) or candidate.get("close_price", []) or []
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
                empty_fig = px.line(pd.DataFrame({"x": [], "y": []}), x="x", y="y")
                title = f"Error: {e}"
                return empty_fig.update_layout(title=title)

        dates = pd.to_datetime(data.get("dates", []))
        open_ = data.get("open", []) or data.get("open_price", []) or []
        high = data.get("high", []) or []
        low = data.get("low", []) or []
        close = data.get("close", []) or data.get("close_price", []) or []

        n = min(len(dates), len(open_), len(high), len(low), len(close))
        if n == 0:
            logger.info(
                "No data after normalization for %s: dates=%d open=%d high=%d low=%d close=%d",
                ticker,
                len(dates),
                len(open_),
                len(high),
                len(low),
                len(close),
            )
            return px.line(
                pd.DataFrame({"x": [], "y": []}), x="x", y="y"
            ).update_layout(
                title=f"No data for {ticker}"
            )

        df = pd.DataFrame({
            "date": dates[:n],
            "open": open_[:n],
            "high": high[:n],
            "low": low[:n],
            "close": close[:n]
        })

        if graph_type == "candle":
            fig = go.Figure(data=[go.Candlestick(
                x=df["date"],
                open=df["open"],
                high=df["high"],
                low=df["low"],
                close=df["close"],
                increasing_line_color=ACCENT,  # green
                decreasing_line_color=STATUS_ERROR,  # red
            )])
            fig.update_layout(
                title=f"Candlestick Chart: {ticker}",
                xaxis_title="Date",
                yaxis_title="Price $",
                xaxis=dict(
                    showticklabels=True,
                    showgrid=False,
                    zeroline=False,
                    showline=True,
                    title="Date",
                    tickfont={"color": TEXT_SECONDARY},
                ),
                yaxis=dict(
                    showticklabels=True,
                    showgrid=False,
                    zeroline=False,
                    showline=True,
                    title="Price $",
                    tickfont={"color": TEXT_SECONDARY},
                ),
                paper_bgcolor=BG_SURFACE,
                plot_bgcolor=BG_SURFACE,
                font_color=TEXT_SECONDARY,
            )
            return fig
        else:
            fig = px.line(
                df,
                x="date",
                y="close",
                color_discrete_sequence=[TEXT_PRIMARY],
                labels={"date": "Date", "close": "Price"},
            )
            fig.update_layout(
                xaxis=dict(
                    showticklabels=True,
                    showgrid=False,
                    zeroline=False,
                    showline=True,
                    title="Date",
                    tickfont={"color": TEXT_SECONDARY},
                ),
                yaxis=dict(
                    showticklabels=True,
                    showgrid=False,
                    zeroline=False,
                    showline=True,
                    title="Price $",
                    tickfont={"color": TEXT_SECONDARY},
                ),
                paper_bgcolor=BG_SURFACE,
                plot_bgcolor=BG_SURFACE,
                font_color=TEXT_SECONDARY,
            )
            if fig.data:
                fig.data[0].update(hovertemplate="$%{y:.2f}<extra></extra>")
            return fig
    except Exception as e:
        empty_fig = px.line(pd.DataFrame({"x": [], "y": []}), x="x", y="y")
        return empty_fig.update_layout(title=f"Error: {e}")


@callback(Output("ticker-title", "children"), Input("ticker-input", "value"))
def update_title_from_input(ticker_value):
    # show the ticker or fallback text; format as you like
    return (ticker_value or "TICKER").upper()


@callback(
    Output("root-container", "style"),
    Input("theme-input", "value")
)
def update_root_style(theme):
    colors = get_theme(theme)
    return {
        "backgroundColor": colors["BG_SURFACE"],
        "color": colors["TEXT_SECONDARY"],
        "minHeight": "100vh",
        "paddingTop": "12px"
    }


@callback(
    Output("ticker-title", "style"),
    Input("theme-input", "value"),
    prevent_initial_call=True
)
def update_title_style(theme):
    colors = get_theme(theme)
    return {
        "fontSize": "36px",
        "fontWeight": "700",
        "margin": 0,
        "color": colors["TEXT_SECONDARY"]
    }


@callback(
    Output("price-display", "style"),
    Input("theme-input", "value"),
    prevent_initial_call=True
)
def update_price_style(theme):
    colors = get_theme(theme)
    return {
        "fontSize": "24px",
        "marginTop": "6px",
        "color": colors["TEXT_PRIMARY"]
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8050, debug=False)
