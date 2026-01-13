import pytest
from datetime import datetime, timedelta, timezone as dt_timezone
from Incrementum.models.stock import StockModel
from Incrementum.models.stock_history import StockHistory

pytestmark = pytest.mark.django_db


def test_data_for_one_stock_without_gaps():
    stock = StockModel.objects.create(
        symbol="NVDA",
        company_name="NVIDIA Corporation"
    )

    start_date = datetime(2025, 12, 15, 9, 30, tzinfo=dt_timezone.utc)
    base_price = 50000  # $500.00 in cents

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
    actual_records = StockHistory.objects.filter(stock_symbol=stock).count()
    assert actual_records == 35


def test_data_for_one_stock_with_gaps():
    stock = StockModel.objects.create(
        symbol="AAPL",
        company_name="Apple Inc."
    )

    start_date = datetime(2025, 12, 15, 9, 30, tzinfo=dt_timezone.utc)
    base_price = 18000  # $180.00 in cents

    for day in [0, 1, 3, 4]:
        current_day = start_date + timedelta(days=day)

        # Create hourly data but skip hours 2 and 4 (creating gaps)
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
 
    actual_records = StockHistory.objects.filter(stock_symbol=stock).count()
    assert actual_records == 20

    gap_day = start_date + timedelta(days=2)
    gap_records = StockHistory.objects.filter(
        stock_symbol=stock,
        day_and_time__date=gap_day.date()
    ).count()
    assert gap_records == 0


def test_all_days_present_for_one_stock():
    stock = StockModel.objects.create(
        symbol="TSLA",
        company_name="Tesla Inc."
    )

    start_date = datetime(2025, 12, 1, 9, 30, tzinfo=dt_timezone.utc)
    base_price = 25000  # $250.00 in cents
    num_days = 7

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


def test_all_hours_present_for_one_stock():
    stock = StockModel.objects.create(
        symbol="MSFT",
        company_name="Microsoft Corporation"
    )

    start_date = datetime(2025, 12, 20, 9, 30, tzinfo=dt_timezone.utc)
    base_price = 42000  # $420.00 in cents
    trading_hours = 7  # 7 trading hours

    # Create data for all trading hours on a single day
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
    
    # Verify all trading hours are present
    records = StockHistory.objects.filter(
        stock_symbol=stock
    ).order_by('day_and_time')
    
    assert records.count() == trading_hours
    
    # Verify timestamps match what we created
    actual_timestamps = [record.day_and_time for record in records]
    assert actual_timestamps == timestamps


def test_at_least_one_data_point_for_one_stock():
    stock = StockModel.objects.create(
        symbol="GOOGL",
        company_name="Alphabet Inc."
    )

    initial_count = StockHistory.objects.filter(stock_symbol=stock).count()
    assert initial_count == 0

    timestamp = datetime(2025, 12, 25, 10, 0, tzinfo=dt_timezone.utc)
    StockHistory.objects.create(
        stock_symbol=stock,
        day_and_time=timestamp,
        open_price=14000,  # $140.00 in cents
        close_price=14050,
        high=14150,
        low=13950,
        volume=500000
    )

    final_count = StockHistory.objects.filter(stock_symbol=stock).count()
    assert final_count >= 1
    
    data_point = StockHistory.objects.get(stock_symbol=stock)
    assert data_point.stock_symbol == stock
    assert data_point.day_and_time == timestamp
    assert data_point.open_price == 14000


def test_single_stock_with_blacklisted_times():
    stock = StockModel.objects.create(
        symbol="AAPL",
        company_name="Apple Inc."
    )

    start_date = datetime(2025, 12, 19, 9, 30, tzinfo=dt_timezone.utc)
    base_price = 18000
    blacklisted_times = []
    
    for day in range(5):
        current_day = start_date + timedelta(days=day)
        day_of_week = current_day.weekday()
        
        if day_of_week in [5, 6]:
            blacklisted_times.extend([
                current_day + timedelta(hours=h) for h in range(7)
            ])
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
    
    actual_records = StockHistory.objects.filter(stock_symbol=stock).count()
    assert actual_records == 21
    
    for blacklisted_time in blacklisted_times:
        records = StockHistory.objects.filter(
            stock_symbol=stock,
            day_and_time=blacklisted_time
        ).count()
        assert records == 0
    
    all_records = StockHistory.objects.filter(stock_symbol=stock)
    for record in all_records:
        assert record.day_and_time.weekday() not in [5, 6]


def test_single_stock_with_blacklisted_hours():
    stock = StockModel.objects.create(
        symbol="TSLA",
        company_name="Tesla Inc."
    )

    start_date = datetime(2025, 12, 15, 6, 0, tzinfo=dt_timezone.utc)
    base_price = 25000
    blacklisted_hours = [6, 7, 8, 17, 18, 19, 20]
    allowed_hours = [9, 10, 11, 12, 13, 14, 15, 16]
    
    for hour_offset in range(15):
        timestamp = start_date + timedelta(hours=hour_offset)
        current_hour = timestamp.hour
        
        if current_hour in allowed_hours:
            StockHistory.objects.create(
                stock_symbol=stock,
                day_and_time=timestamp,
                open_price=base_price,
                close_price=base_price + 50,
                high=base_price + 100,
                low=base_price - 50,
                volume=1000000
            )
    
    actual_records = StockHistory.objects.filter(stock_symbol=stock).count()
    assert actual_records == 8
    
    all_records = StockHistory.objects.filter(stock_symbol=stock)
    for record in all_records:
        hour = record.day_and_time.hour
        assert hour in allowed_hours
        assert hour not in blacklisted_hours
    
    for hour in blacklisted_hours:
        if 6 <= hour <= 20:
            blacklisted_time = start_date.replace(hour=hour)
            records = StockHistory.objects.filter(
                stock_symbol=stock,
                day_and_time=blacklisted_time
            ).count()
            assert records == 0
