"""
Views for Candlestick Pattern Analysis

Provides endpoints to analyze candlestick patterns on real stock data.
"""
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from Incrementum.stock_history_service import StockHistoryService
from Incrementum.services.candlestick_patterns import CandlestickPatternAnalyzer


def _error_response(message: str, ticker: str = None, period: str = None,
                    interval: str = None, status: int = 500):
    """Create a standardized error response."""
    response = {'error': message}
    if ticker:
        response['ticker'] = ticker
    if period:
        response['period'] = period
    if interval:
        response['interval'] = interval
    return JsonResponse(response, status=status)


def _prepare_dataframe(df: pd.DataFrame, data_source: str) -> pd.DataFrame:
    """Prepare DataFrame by renaming columns and converting prices if needed."""
    if data_source == 'database':
        df = df.rename(columns={
            'open_price': 'Open',
            'close_price': 'Close',
            'high': 'High',
            'low': 'Low'
        })
        # Convert prices from cents to dollars
        for col in ['Open', 'High', 'Low', 'Close']:
            if col in df.columns:
                df[col] = df[col] / 100.0
    return df


def _calculate_summary(patterns: dict, total_candles: int) -> dict:
    """Calculate summary statistics for pattern occurrences."""
    hammer_pct = (
        round(len(patterns['hammers']) / total_candles * 100, 2)
        if total_candles else 0
    )
    hanging_man_pct = (
        round(len(patterns['hanging_men']) / total_candles * 100, 2)
        if total_candles else 0
    )
    return {
        'hammer_count': len(patterns['hammers']),
        'hanging_man_count': len(patterns['hanging_men']),
        'hammer_percentage': hammer_pct,
        'hanging_man_percentage': hanging_man_pct
    }


@csrf_exempt
@require_http_methods(["GET"])
def analyze_candlestick_patterns(request, ticker):
    """
    Analyze candlestick patterns for a given stock ticker.

    URL Parameters:
        ticker: Stock ticker symbol (e.g., AAPL, GOOGL)

    Query Parameters:
        period: Time period for data (default: 1mo)
                Options: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
        interval: Data interval (default: 1d)
                  Options: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
        start_date: Start date for analysis (YYYY-MM-DD format)
        end_date: End date for analysis (YYYY-MM-DD format)
        is_hourly: Filter by hourly data (true/false)

    Returns:
        JSON response containing:
        - ticker: Stock ticker symbol
        - period: Analysis period
        - interval: Data interval
        - total_candles: Total number of candles analyzed
        - hammers: List of hammer patterns found
        - hanging_men: List of hanging man patterns found
        - data_source: Source of the data (database or yfinance)
    """
    ticker = ticker.upper()
    period = request.GET.get('period', '1mo')
    interval = request.GET.get('interval', '1d')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # Parse is_hourly parameter
    is_hourly_param = request.GET.get('is_hourly')
    is_hourly = is_hourly_param.lower() == 'true' if is_hourly_param else None

    try:
        # Fetch stock data
        stock_service = StockHistoryService()

        # Try database first
        df = stock_service.get_db_history(
            ticker=ticker,
            start_date=start_date,
            end_date=end_date,
            is_hourly=is_hourly
        )

        data_source = 'database'

        # If no data in database, fetch from yfinance
        if df is None or df.empty:
            df, _ = stock_service.history(
                ticker=ticker,
                period=period,
                interval=interval
            )
            data_source = 'yfinance'

        if df is None or df.empty:
            return _error_response(
                f'No data available for ticker {ticker}',
                ticker, period, interval, status=404
            )

        # Prepare DataFrame for analysis
        df = _prepare_dataframe(df, data_source)

        # Validate required columns
        required_columns = ['Open', 'High', 'Low', 'Close']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return _error_response(
                f'Missing required columns: {", ".join(missing_columns)}',
                ticker, status=400
            )

        # Analyze patterns
        analyzer = CandlestickPatternAnalyzer(df[required_columns])
        patterns = analyzer.analyze_patterns()

        # Prepare response
        return JsonResponse({
            'ticker': ticker,
            'period': period,
            'interval': interval,
            'data_source': data_source,
            'total_candles': len(df),
            **patterns,
            'summary': _calculate_summary(patterns, len(df))
        }, safe=False)

    except Exception as e:
        return _error_response(
            f'Error analyzing patterns: {str(e)}',
            ticker, period, interval
        )


@csrf_exempt
@require_http_methods(["GET"])
def test_pattern_detection(request):
    """
    Test endpoint with sample data to demonstrate pattern detection.

    Returns:
        JSON response with sample candles and detected patterns
    """
    # Create sample data with known patterns
    sample_data = pd.DataFrame({
        'Open': [100.0, 100.0, 110.0, 105.0, 102.0],
        'High': [110.0, 102.0, 120.0, 107.0, 108.0],
        'Low': [95.0, 85.0, 105.0, 90.0, 98.0],
        'Close': [105.0, 101.0, 118.0, 106.0, 103.0]
    })

    try:
        analyzer = CandlestickPatternAnalyzer(sample_data)
        patterns = analyzer.analyze_patterns()

        return JsonResponse({
            'description': 'Sample candlestick data with known patterns',
            'sample_candles': sample_data.to_dict('records'),
            'patterns_found': patterns,
            'explanation': {
                'candle_0': 'Regular candle - no specific pattern',
                'candle_1': (
                    'HAMMER - Small body (6%), long lower shadow (88%), '
                    'small upper shadow (6%)'
                ),
                'candle_2': 'Regular candle - body too large for hammer/hanging man',
                'candle_3': (
                    'HAMMER - Small body (6%), long lower shadow (88%), '
                    'small upper shadow (6%)'
                ),
                'candle_4': 'Regular candle - no specific pattern'
            }
        }, safe=False)

    except Exception as e:
        return _error_response(f'Error in test endpoint: {str(e)}')
