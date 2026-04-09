from django.db import connection
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from Incrementum.models.stock import StockModel


PERCENT_CHANGE_CACHE_TTL_MINUTES = 60


def _coerce_aware_datetime(value):
    if value is None:
        return None
    if timezone.is_naive(value):
        return timezone.make_aware(value, timezone.get_current_timezone())
    return value


def fifty_two_week_high_dict(stock=None, stocks=None):
    if stocks is None:
        stocks = [stock] if stock else []

    if not stocks:
        return {}

    query = """
        SELECT DISTINCT ON (stock_symbol) stock_symbol, high
        FROM incrementum.stock_history
        WHERE stock_symbol = ANY(%s)
        ORDER BY stock_symbol, high DESC
    """
    with connection.cursor() as cursor:
        cursor.execute(query, [stocks])
        results = cursor.fetchall()

    return {row[0]: row[1] for row in results}


def fifty_two_week_low_dict(stock=None, stocks=None):
    if stocks is None:
        stocks = [stock] if stock else []

    if not stocks:
        return {}

    query = """
        SELECT DISTINCT ON (stock_symbol) stock_symbol, low
        FROM incrementum.stock_history
        WHERE stock_symbol = ANY(%s)
        ORDER BY stock_symbol, low ASC
    """
    with connection.cursor() as cursor:
        cursor.execute(query, [stocks])
        results = cursor.fetchall()

    return {row[0]: row[1] for row in results}


def current_price_dict(stock=None, stocks=None):
    if stocks is None:
        stocks = [stock] if stock else []

    if not stocks:
        return {}

    query = """
        SELECT DISTINCT ON (stock_symbol) stock_symbol, close_price
        FROM incrementum.stock_history
        WHERE stock_symbol = ANY(%s)
        ORDER BY stock_symbol, day_and_time DESC
    """
    with connection.cursor() as cursor:
        cursor.execute(query, [stocks])
        results = cursor.fetchall()

    return {row[0]: row[1] for row in results}


def day_percent_change(stock=None, stocks=None):
    if stocks is None:
        stocks = [stock] if stock else []

    if not stocks:
        return {}

    now = timezone.now()
    fresh_after = now - timedelta(minutes=PERCENT_CHANGE_CACHE_TTL_MINUTES)

    cached_rows = StockModel.objects.filter(symbol__in=stocks).values(
        'symbol',
        'day_percent_change',
        'updated_at',
    )
    cached_by_symbol = {row['symbol']: row for row in cached_rows}

    percent_changes = {}
    stale_or_missing_symbols = []

    for symbol in stocks:
        cached = cached_by_symbol.get(symbol)
        cached_updated_at = _coerce_aware_datetime(
            cached['updated_at']
        ) if cached else None
        if (
            cached
            and cached['day_percent_change'] is not None
            and cached_updated_at is not None
            and cached_updated_at >= fresh_after
        ):
            percent_changes[symbol] = float(cached['day_percent_change'])
        else:
            stale_or_missing_symbols.append(symbol)

    if not stale_or_missing_symbols:
        return percent_changes

    query = """
        SELECT stock_symbol, close_price, day_and_time
        FROM incrementum.stock_history
        WHERE stock_symbol = ANY(%s)
        AND EXTRACT(HOUR FROM day_and_time) = 17
        ORDER BY stock_symbol, day_and_time DESC
    """
    with connection.cursor() as cursor:
        cursor.execute(query, [stale_or_missing_symbols])
        results = cursor.fetchall()

    stock_prices = {}
    for row in results:
        symbol = row[0]
        if symbol not in stock_prices:
            stock_prices[symbol] = []
        stock_prices[symbol].append(row[1])

    recalculated_changes = {}
    for symbol, prices in stock_prices.items():
        if len(prices) >= 2 and prices[1] != 0:
            percent_change = ((prices[0] - prices[1]) / prices[1]) * 100
            recalculated_changes[symbol] = percent_change

    if stale_or_missing_symbols:
        stocks_to_update = StockModel.objects.filter(
            symbol__in=stale_or_missing_symbols
        )
        for stock_obj in stocks_to_update:
            recalculated_value = recalculated_changes.get(stock_obj.symbol)
            stock_obj.day_percent_change = (
                Decimal(str(recalculated_value))
                if recalculated_value is not None
                else None
            )
            stock_obj.updated_at = now
        StockModel.objects.bulk_update(
            stocks_to_update,
            ['day_percent_change', 'updated_at'],
        )

    percent_changes.update(recalculated_changes)

    return percent_changes
