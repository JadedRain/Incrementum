from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0007_customcollection_purchase_prices'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE TABLE IF NOT EXISTS stock_history (
                    id serial primary key,
                    stock_symbol varchar(20) not null references stock(symbol),
                    day_and_time timestamp not null,
                    open_price integer not null,
                    close_price integer not null,
                    high integer not null,
                    low integer not null,
                    volume integer not null,
                    is_hourly boolean default true,
                    unique (stock_symbol, day_and_time)
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
                    id serial primary key,
                    stock_symbol varchar(10) not null,
                    timestamp timestamp not null,
                    time_added timestamp not null,
                    foreign key (stock_symbol) references stock(symbol) on delete cascade,
                    unique (stock_symbol, timestamp)
                );

                CREATE INDEX IF NOT EXISTS idx_blacklist_symbol
                ON blacklist (stock_symbol);
            """,
            reverse_sql="""
                DROP TABLE IF EXISTS blacklist;
            """
        ),
    ]
