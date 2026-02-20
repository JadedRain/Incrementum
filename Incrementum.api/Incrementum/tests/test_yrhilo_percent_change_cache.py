from datetime import timedelta, datetime
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.utils import timezone

from Incrementum.yrhilo import day_percent_change


@patch('Incrementum.yrhilo.connection.cursor')
@patch('Incrementum.yrhilo.StockModel')
def test_day_percent_change_uses_fresh_cached_value(mock_stock_model, mock_cursor):
    now = timezone.now()

    cache_qs = MagicMock()
    cache_qs.values.return_value = [
        {
            'symbol': 'AAPL',
            'day_percent_change': Decimal('2.500000'),
            'updated_at': now,
        }
    ]
    mock_stock_model.objects.filter.return_value = cache_qs

    result = day_percent_change(stocks=['AAPL'])

    assert result == {'AAPL': 2.5}
    mock_cursor.assert_not_called()
    mock_stock_model.objects.bulk_update.assert_not_called()


@patch('Incrementum.yrhilo.connection.cursor')
@patch('Incrementum.yrhilo.StockModel')
def test_day_percent_change_recalculates_and_persists_when_cache_stale(mock_stock_model, mock_cursor):
    now = timezone.now()

    cache_qs = MagicMock()
    cache_qs.values.return_value = [
        {
            'symbol': 'AAPL',
            'day_percent_change': Decimal('1.000000'),
            'updated_at': now - timedelta(hours=2),
        }
    ]

    stock_obj = SimpleNamespace(
        symbol='AAPL',
        day_percent_change=None,
        updated_at=None,
    )

    mock_stock_model.objects.filter.side_effect = [cache_qs, [stock_obj]]

    cursor_ctx = MagicMock()
    cursor = MagicMock()
    cursor_ctx.__enter__.return_value = cursor
    cursor_ctx.__exit__.return_value = None
    mock_cursor.return_value = cursor_ctx

    cursor.fetchall.return_value = [
        ('AAPL', 110, now),
        ('AAPL', 100, now - timedelta(days=1)),
    ]

    result = day_percent_change(stocks=['AAPL'])

    assert result['AAPL'] == 10.0
    cursor.execute.assert_called_once()
    assert cursor.execute.call_args[0][1] == [['AAPL']]

    mock_stock_model.objects.bulk_update.assert_called_once()
    updated_objs = mock_stock_model.objects.bulk_update.call_args[0][0]
    assert len(updated_objs) == 1
    assert updated_objs[0].symbol == 'AAPL'
    assert updated_objs[0].day_percent_change == Decimal('10.0')
    assert updated_objs[0].updated_at is not None


@patch('Incrementum.yrhilo.connection.cursor')
@patch('Incrementum.yrhilo.StockModel')
def test_day_percent_change_accepts_naive_updated_at(mock_stock_model, mock_cursor):
    now_naive = datetime.now()

    cache_qs = MagicMock()
    cache_qs.values.return_value = [
        {
            'symbol': 'AAPL',
            'day_percent_change': Decimal('2.500000'),
            'updated_at': now_naive,
        }
    ]
    mock_stock_model.objects.filter.return_value = cache_qs

    result = day_percent_change(stocks=['AAPL'])

    assert result == {'AAPL': 2.5}
    mock_cursor.assert_not_called()
    mock_stock_model.objects.bulk_update.assert_not_called()


@patch('Incrementum.yrhilo.connection.cursor')
@patch('Incrementum.yrhilo.StockModel')
def test_day_percent_change_persists_null_when_no_recalculation_available(mock_stock_model, mock_cursor):
    now = timezone.now()

    cache_qs = MagicMock()
    cache_qs.values.return_value = [
        {
            'symbol': 'AAPL',
            'day_percent_change': None,
            'updated_at': now - timedelta(hours=2),
        }
    ]

    stock_obj = SimpleNamespace(
        symbol='AAPL',
        day_percent_change=Decimal('1.0'),
        updated_at=now - timedelta(hours=2),
    )

    mock_stock_model.objects.filter.side_effect = [cache_qs, [stock_obj]]

    cursor_ctx = MagicMock()
    cursor = MagicMock()
    cursor_ctx.__enter__.return_value = cursor
    cursor_ctx.__exit__.return_value = None
    mock_cursor.return_value = cursor_ctx

    cursor.fetchall.return_value = [
        ('AAPL', 110, now),
    ]

    result = day_percent_change(stocks=['AAPL'])

    assert result == {}
    mock_stock_model.objects.bulk_update.assert_called_once()
    updated_objs = mock_stock_model.objects.bulk_update.call_args[0][0]
    assert updated_objs[0].symbol == 'AAPL'
    assert updated_objs[0].day_percent_change is None
    assert updated_objs[0].updated_at is not None
