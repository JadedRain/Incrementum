from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0007_customcollection_purchase_prices'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE TABLE IF NOT EXISTS stock_history (
                    stock_symbol VARCHAR(20) NOT NULL,
                    day_and_time DATETIME NOT NULL,
                    open_price INTEGER NOT NULL,
                    close_price INTEGER NOT NULL,
                    high INTEGER NOT NULL,
                    low INTEGER NOT NULL,
                    volume INTEGER NOT NULL,
                    is_hourly BOOLEAN DEFAULT TRUE,
                    PRIMARY KEY (stock_symbol, day_and_time),
                    FOREIGN KEY (stock_symbol) 
                    REFERENCES stock (symbol) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_stock_history_symbol_time
                ON stock_history (stock_symbol, day_and_time);
            """,
            reverse_sql="""
                DROP TABLE IF EXISTS stock_history;
            """
        ),
        migrations.RunSQL(
            sql="""
                CREATE TABLE IF NOT EXISTS blacklist (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    stock_symbol VARCHAR(10) NOT NULL,
                    timestamp DATETIME NOT NULL,
                    time_added DATETIME NOT NULL,
                    FOREIGN KEY (stock_symbol) 
                    REFERENCES stock (symbol) ON DELETE CASCADE,
                    UNIQUE (stock_symbol, timestamp)
                );

                CREATE INDEX IF NOT EXISTS idx_blacklist_symbol
                ON blacklist (stock_symbol);
            """,
            reverse_sql="""
                DROP TABLE IF EXISTS blacklist;
            """
        ),
    ]
