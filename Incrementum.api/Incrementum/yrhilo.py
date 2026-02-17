from django.db import connection


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

    query = """
        SELECT stock_symbol, close_price, day_and_time
        FROM incrementum.stock_history
        WHERE stock_symbol = ANY(%s)
        AND EXTRACT(HOUR FROM day_and_time) = 17
        ORDER BY stock_symbol, day_and_time DESC
    """
    with connection.cursor() as cursor:
        cursor.execute(query, [stocks])
        results = cursor.fetchall()

    stock_prices = {}
    for row in results:
        symbol = row[0]
        if symbol not in stock_prices:
            stock_prices[symbol] = []
        stock_prices[symbol].append(row[1])

    percent_changes = {}
    for symbol, prices in stock_prices.items():
        if len(prices) >= 2 and prices[1] != 0:
            percent_change = ((prices[0] - prices[1]) / prices[1]) * 100
            percent_changes[symbol] = percent_change

    return percent_changes
