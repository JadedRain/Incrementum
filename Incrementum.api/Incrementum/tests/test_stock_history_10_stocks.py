import pytest
from datetime import datetime, timedelta, timezone as dt_timezone
from Incrementum.models.stock import StockModel
from Incrementum.models.stock_history import StockHistory

pytestmark = pytest.mark.django_db


def test_data_for_ten_stocks_without_gaps():
    stocks_data = [
        ("NVDA", "NVIDIA Corporation"),
        ("AAPL", "Apple Inc."),
        ("MSFT", "Microsoft Corporation"),
        ("GOOGL", "Alphabet Inc."),
        ("AMZN", "Amazon.com Inc."),
        ("TSLA", "Tesla Inc."),
        ("META", "Meta Platforms Inc."),
        ("AMD", "Advanced Micro Devices Inc."),
        ("INTC", "Intel Corporation"),
        ("NFLX", "Netflix Inc.")
    ]

    start_date = datetime(2025, 12, 15, 9, 30, tzinfo=dt_timezone.utc)
    
    for idx, (symbol, company_name) in enumerate(stocks_data):
        stock = StockModel.objects.create(
            symbol=symbol,
            company_name=company_name
        )
        base_price = 50000 + (idx * 5000)

        for day in range(5):
            current_day = start_date + timedelta(days=day)

            for hour_offset in range(7):
                timestamp = current_day + timedelta(hours=hour_offset)

                variation = (hour_offset * 100) + (day * 500)
                open_price = base_price + variation
                close_price = open_price + 50
                high = close_price + 100
                low = open_price - 50
                volume = 1000000 + (hour_offset * 10000)

                StockHistory.objects.create(
                    stock_symbol=stock,
                    day_and_time=timestamp,
                    open_price=open_price,
                    close_price=close_price,
                    high=high,
                    low=low,
                    volume=volume
                )
    
    for symbol, _ in stocks_data:
        stock = StockModel.objects.get(symbol=symbol)
        actual_records = StockHistory.objects.filter(stock_symbol=stock).count()
        assert actual_records == 35
    
    total_records = StockHistory.objects.count()
    assert total_records == 350


def test_data_for_ten_stocks_with_gaps():
    stocks_data = [
        ("AAPL", "Apple Inc."),
        ("GOOGL", "Alphabet Inc."),
        ("MSFT", "Microsoft Corporation"),
        ("AMZN", "Amazon.com Inc."),
        ("META", "Meta Platforms Inc."),
        ("NVDA", "NVIDIA Corporation"),
        ("TSLA", "Tesla Inc."),
        ("AMD", "Advanced Micro Devices Inc."),
        ("NFLX", "Netflix Inc."),
        ("INTC", "Intel Corporation")
    ]

    start_date = datetime(2025, 12, 15, 9, 30, tzinfo=dt_timezone.utc)
    
    for idx, (symbol, company_name) in enumerate(stocks_data):
        stock = StockModel.objects.create(
            symbol=symbol,
            company_name=company_name
        )
        base_price = 18000 + (idx * 3000)

        for day in [0, 1, 3, 4]:
            current_day = start_date + timedelta(days=day)

            for hour_offset in [0, 1, 3, 5, 6]:
                timestamp = current_day + timedelta(hours=hour_offset)

                variation = (hour_offset * 100) + (day * 500)
                open_price = base_price + variation
                close_price = open_price + 50
                high = close_price + 100
                low = open_price - 50
                volume = 1000000 + (hour_offset * 10000)

                StockHistory.objects.create(
                    stock_symbol=stock,
                    day_and_time=timestamp,
                    open_price=open_price,
                    close_price=close_price,
                    high=high,
                    low=low,
                    volume=volume
                )
 
    gap_day = start_date + timedelta(days=2)
    for symbol, _ in stocks_data:
        stock = StockModel.objects.get(symbol=symbol)
        actual_records = StockHistory.objects.filter(stock_symbol=stock).count()
        assert actual_records == 20
        
        gap_records = StockHistory.objects.filter(
            stock_symbol=stock,
            day_and_time__date=gap_day.date()
        ).count()
        assert gap_records == 0
    
    total_records = StockHistory.objects.count()
    assert total_records == 200


def test_all_days_present_for_ten_stocks():
    stocks_data = [
        ("TSLA", "Tesla Inc."),
        ("AMD", "Advanced Micro Devices Inc."),
        ("NVDA", "NVIDIA Corporation"),
        ("INTC", "Intel Corporation"),
        ("AAPL", "Apple Inc."),
        ("MSFT", "Microsoft Corporation"),
        ("GOOGL", "Alphabet Inc."),
        ("META", "Meta Platforms Inc."),
        ("AMZN", "Amazon.com Inc."),
        ("NFLX", "Netflix Inc.")
    ]

    start_date = datetime(2025, 12, 1, 9, 30, tzinfo=dt_timezone.utc)
    num_days = 7
    
    for idx, (symbol, company_name) in enumerate(stocks_data):
        stock = StockModel.objects.create(
            symbol=symbol,
            company_name=company_name
        )
        base_price = 25000 + (idx * 2000)

        for day in range(num_days):
            current_day = start_date + timedelta(days=day)
            timestamp = current_day + timedelta(hours=0)

            StockHistory.objects.create(
                stock_symbol=stock,
                day_and_time=timestamp,
                open_price=base_price,
                close_price=base_price + 50,
                high=base_price + 100,
                low=base_price - 50,
                volume=1000000
            )
    
    for symbol, _ in stocks_data:
        stock = StockModel.objects.get(symbol=symbol)
        unique_days = StockHistory.objects.filter(
            stock_symbol=stock
        ).dates('day_and_time', 'day')
        
        assert len(unique_days) == num_days
        
        for day in range(num_days):
            expected_day = (start_date + timedelta(days=day)).date()
            day_records = StockHistory.objects.filter(
                stock_symbol=stock,
                day_and_time__date=expected_day
            ).count()
            assert day_records > 0
    
    total_records = StockHistory.objects.count()
    assert total_records == 70


def test_all_hours_present_for_ten_stocks():
    stocks_data = [
        ("MSFT", "Microsoft Corporation"),
        ("AAPL", "Apple Inc."),
        ("AMZN", "Amazon.com Inc."),
        ("NVDA", "NVIDIA Corporation"),
        ("GOOGL", "Alphabet Inc."),
        ("META", "Meta Platforms Inc."),
        ("TSLA", "Tesla Inc."),
        ("NFLX", "Netflix Inc."),
        ("AMD", "Advanced Micro Devices Inc."),
        ("INTC", "Intel Corporation")
    ]

    start_date = datetime(2025, 12, 20, 9, 30, tzinfo=dt_timezone.utc)
    trading_hours = 7
    
    stock_timestamps = {}
    
    for idx, (symbol, company_name) in enumerate(stocks_data):
        stock = StockModel.objects.create(
            symbol=symbol,
            company_name=company_name
        )
        base_price = 42000 + (idx * 4000)
        timestamps = []

        for hour_offset in range(trading_hours):
            timestamp = start_date + timedelta(hours=hour_offset)
            timestamps.append(timestamp)

            variation = hour_offset * 50
            open_price = base_price + variation
            close_price = open_price + 50
            high = close_price + 100
            low = open_price - 50
            volume = 1000000 + (hour_offset * 10000)

            StockHistory.objects.create(
                stock_symbol=stock,
                day_and_time=timestamp,
                open_price=open_price,
                close_price=close_price,
                high=high,
                low=low,
                volume=volume
            )
        
        stock_timestamps[symbol] = timestamps
    
    for symbol, _ in stocks_data:
        stock = StockModel.objects.get(symbol=symbol)
        records = StockHistory.objects.filter(
            stock_symbol=stock
        ).order_by('day_and_time')
        
        assert records.count() == trading_hours
        
        actual_timestamps = [record.day_and_time for record in records]
        assert actual_timestamps == stock_timestamps[symbol]
    
    total_records = StockHistory.objects.count()
    assert total_records == 70


def test_at_least_one_data_point_for_ten_stocks():
    stocks_data = [
        ("GOOGL", "Alphabet Inc."),
        ("AAPL", "Apple Inc."),
        ("MSFT", "Microsoft Corporation"),
        ("AMZN", "Amazon.com Inc."),
        ("META", "Meta Platforms Inc."),
        ("NVDA", "NVIDIA Corporation"),
        ("TSLA", "Tesla Inc."),
        ("NFLX", "Netflix Inc."),
        ("AMD", "Advanced Micro Devices Inc."),
        ("INTC", "Intel Corporation")
    ]

    base_timestamp = datetime(2025, 12, 25, 10, 0, tzinfo=dt_timezone.utc)
    
    for idx, (symbol, company_name) in enumerate(stocks_data):
        stock = StockModel.objects.create(
            symbol=symbol,
            company_name=company_name
        )

        initial_count = StockHistory.objects.filter(stock_symbol=stock).count()
        assert initial_count == 0

        timestamp = base_timestamp + timedelta(minutes=idx)
        base_price = 14000 + (idx * 1000)
        
        StockHistory.objects.create(
            stock_symbol=stock,
            day_and_time=timestamp,
            open_price=base_price,
            close_price=base_price + 50,
            high=base_price + 150,
            low=base_price - 50,
            volume=500000
        )

    for idx, (symbol, _) in enumerate(stocks_data):
        stock = StockModel.objects.get(symbol=symbol)
        final_count = StockHistory.objects.filter(stock_symbol=stock).count()
        assert final_count >= 1
        
        data_point = StockHistory.objects.get(stock_symbol=stock)
        assert data_point.stock_symbol == stock
        expected_timestamp = base_timestamp + timedelta(minutes=idx)
        assert data_point.day_and_time == expected_timestamp
        expected_price = 14000 + (idx * 1000)
        assert data_point.open_price == expected_price
    
    total_records = StockHistory.objects.count()
    assert total_records == 10


def test_ten_stocks_with_blacklisted_times():
    stocks_data = [
        ("AAPL", "Apple Inc."),
        ("MSFT", "Microsoft Corporation"),
        ("GOOGL", "Alphabet Inc."),
        ("AMZN", "Amazon.com Inc."),
        ("META", "Meta Platforms Inc."),
        ("NVDA", "NVIDIA Corporation"),
        ("TSLA", "Tesla Inc."),
        ("NFLX", "Netflix Inc."),
        ("AMD", "Advanced Micro Devices Inc."),
        ("INTC", "Intel Corporation")
    ]

    start_date = datetime(2025, 12, 18, 9, 30, tzinfo=dt_timezone.utc)
    holiday_date = datetime(2025, 12, 25, 0, 0, tzinfo=dt_timezone.utc)
    blacklisted_dates = set()
    
    for idx, (symbol, company_name) in enumerate(stocks_data):
        stock = StockModel.objects.create(
            symbol=symbol,
            company_name=company_name
        )
        base_price = 20000 + (idx * 2000)
        
        for day in range(10):
            current_day = start_date + timedelta(days=day)
            day_of_week = current_day.weekday()
            
            if day_of_week in [5, 6]:
                blacklisted_dates.add(current_day.date())
                continue
            
            if current_day.date() == holiday_date.date():
                blacklisted_dates.add(current_day.date())
                continue
            
            for hour_offset in range(7):
                timestamp = current_day + timedelta(hours=hour_offset)
                
                StockHistory.objects.create(
                    stock_symbol=stock,
                    day_and_time=timestamp,
                    open_price=base_price,
                    close_price=base_price + 50,
                    high=base_price + 100,
                    low=base_price - 50,
                    volume=1000000
                )
    
    for symbol, _ in stocks_data:
        stock = StockModel.objects.get(symbol=symbol)
        actual_records = StockHistory.objects.filter(stock_symbol=stock).count()
        assert actual_records == 42
        
        for blacklisted_date in blacklisted_dates:
            records = StockHistory.objects.filter(
                stock_symbol=stock,
                day_and_time__date=blacklisted_date
            ).count()
            assert records == 0
        
        all_records = StockHistory.objects.filter(stock_symbol=stock)
        for record in all_records:
            assert record.day_and_time.weekday() not in [5, 6]
            assert record.day_and_time.date() != holiday_date.date()
    
    total_records = StockHistory.objects.count()
    assert total_records == 420


def test_ten_stocks_with_mixed_blacklist_patterns():
    stocks_data = [
        ("STOCK1", "Stock One Corp"),
        ("STOCK2", "Stock Two Corp"),
        ("STOCK3", "Stock Three Corp"),
        ("STOCK4", "Stock Four Corp"),
        ("STOCK5", "Stock Five Corp"),
        ("STOCK6", "Stock Six Corp"),
        ("STOCK7", "Stock Seven Corp"),
        ("STOCK8", "Stock Eight Corp"),
        ("STOCK9", "Stock Nine Corp"),
        ("STOCK10", "Stock Ten Corp")
    ]

    start_date = datetime(2025, 12, 15, 9, 30, tzinfo=dt_timezone.utc)
    maintenance_time = start_date + timedelta(days=2, hours=3)
    
    for idx, (symbol, company_name) in enumerate(stocks_data):
        stock = StockModel.objects.create(
            symbol=symbol,
            company_name=company_name
        )
        base_price = 15000 + (idx * 1500)
        
        for day in range(5):
            current_day = start_date + timedelta(days=day)
            
            for hour_offset in range(7):
                timestamp = current_day + timedelta(hours=hour_offset)
                
                if timestamp == maintenance_time:
                    continue
                
                StockHistory.objects.create(
                    stock_symbol=stock,
                    day_and_time=timestamp,
                    open_price=base_price,
                    close_price=base_price + 50,
                    high=base_price + 100,
                    low=base_price - 50,
                    volume=1000000
                )
    
    for symbol, _ in stocks_data:
        stock = StockModel.objects.get(symbol=symbol)
        actual_records = StockHistory.objects.filter(stock_symbol=stock).count()
        assert actual_records == 34
        
        maintenance_records = StockHistory.objects.filter(
            stock_symbol=stock,
            day_and_time=maintenance_time
        ).count()
        assert maintenance_records == 0
    
    total_records = StockHistory.objects.count()
    assert total_records == 340
    
    all_maintenance_records = StockHistory.objects.filter(
        day_and_time=maintenance_time
    ).count()
    assert all_maintenance_records == 0
