from django.db import connection

def fifty_two_week_high(stock: str):
    query = """
        SELECT high
        FROM incrementum.stock_history
        WHERE stock_symbol = %s
        ORDER BY high DESC
        LIMIT 1
    """
    with connection.cursor() as cursor:
        cursor.execute(query, [stock])
        result = cursor.fetchone()
    return result[0] if result else None

def fifty_two_week_low(stock: str):
    query = """
        SELECT low
        FROM incrementum.stock_history
        WHERE stock_symbol = %s
        ORDER BY low ASC
        LIMIT 1
    """
    with connection.cursor() as cursor:
        cursor.execute(query, [stock])
        result = cursor.fetchone()
    return result[0] if result else None

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