from logging import Logger
import os
from typing import Optional, Tuple
import pandas as pd
from django.db import connection
from django.utils import timezone
from datetime import datetime


class StockHistoryService:
    def __init__(self):
        # self.logger = logging.getLogger("django")
        self.logger = Logger("logs")

    def get_db_history(
        self,
        ticker: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        is_hourly: Optional[bool] = None
    ) -> Optional[pd.DataFrame]:
        """Get stock history using ORM models (API or database based on settings)"""
        try:
            from Incrementum.models import StockHistory

            self.logger.info(f"[GET_DB_HISTORY] Starting for ticker={ticker}")
            # Build ORM query
            self.logger.info(
                f"[GET_DB_HISTORY] Creating queryset with filter stock_symbol={ticker}")
            queryset = StockHistory.objects.filter(stock_symbol=ticker)
            self.logger.info(
                f"[GET_DB_HISTORY] Queryset type: {type(queryset).__name__}")

            if start_date:
                queryset = queryset.filter(day_and_time__gte=start_date)
                self.logger.info(
                    f"[GET_DB_HISTORY] Applied start_date filter: {start_date}")
            if end_date:
                queryset = queryset.filter(day_and_time__lte=end_date)
                self.logger.info(
                    f"[GET_DB_HISTORY] Applied end_date filter: {end_date}")
            if is_hourly is not None:
                queryset = queryset.filter(is_hourly=is_hourly)
                self.logger.info(
                    f"[GET_DB_HISTORY] Applied is_hourly filter: {is_hourly}")

            queryset = queryset.order_by('day_and_time')
            self.logger.info("[GET_DB_HISTORY] Applied order_by")

            self.logger.info("[GET_DB_HISTORY] Calling queryset.exists()...")
            exists_result = queryset.exists()
            self.logger.info(
                f"[GET_DB_HISTORY] queryset.exists() returned: {exists_result}")

            if not exists_result:
                self.logger.warning(
                    f"[GET_DB_HISTORY] No history found for ticker {ticker}")
                return None

            self.logger.info("[GET_DB_HISTORY] Starting iteration...")
            # Convert ORM results to DataFrame
            data = []
            record_count = 0
            for record in queryset:
                record_count += 1
                if record_count <= 2 or record_count % 1000 == 0:
                    self.logger.debug(
                        f"[GET_DB_HISTORY] Processing record {record_count}, "
                        f"type: {type(record).__name__}")

                # Handle both dict (from API) and model instance (from DB)
                if isinstance(record, dict):
                    # Already a dict from API manager
                    if record_count <= 1:
                        self.logger.debug(
                            f"[GET_DB_HISTORY] Dict record keys: {list(record.keys())}")
                    data.append(record)
                else:
                    # Model instance from database
                    if record_count <= 1:
                        self.logger.debug(
                            f"[GET_DB_HISTORY] Model record: {record}")
                    data.append({
                        'stock_symbol': record.stock_symbol,
                        'day_and_time': record.day_and_time,
                        'open_price': record.open_price,
                        'close_price': record.close_price,
                        'high': record.high,
                        'low': record.low,
                        'volume': record.volume,
                        'is_hourly': record.is_hourly
                    })

            self.logger.info(
                f"[GET_DB_HISTORY] Iteration complete, processed {record_count} records")

            if not data:
                self.logger.warning(
                    f"[GET_DB_HISTORY] No data collected for {ticker} even though exists()=True")
                return None

            df = pd.DataFrame(data)
            self.logger.info(
                f"[GET_DB_HISTORY] Successfully created DataFrame "
                f"with {len(df)} records for {ticker}")
            return df

        except Exception as e:
            self.logger.error(
                f"Error fetching history for {ticker} via ORM: {str(e)}")
            import traceback
            self.logger.error(traceback.format_exc())
            return None

    def save_history_to_db(
        self,
        ticker: str,
        history_df: pd.DataFrame,
        is_hourly: bool = False,
    ) -> bool:

        if history_df is None or history_df.empty:
            self.logger.warning(f"No data to save for {ticker}")
            return False

        try:
            records = []
            for date_index, row in history_df.iterrows():
                if isinstance(date_index, (int, float)):
                    date_index = pd.to_datetime(date_index, unit='ms')
                elif isinstance(date_index, str):
                    try:
                        date_index = pd.to_datetime(date_index)
                    except Exception:
                        pass
                records.append((
                    ticker,
                    date_index,
                    int(row['Open']) if pd.notna(row['Open']) else 0,
                    int(row['Close']) if pd.notna(row['Close']) else 0,
                    int(row['High']) if pd.notna(row['High']) else 0,
                    int(row['Low']) if pd.notna(row['Low']) else 0,
                    int(row['Volume']) if pd.notna(row['Volume']) else 0,
                    is_hourly
                ))

            with connection.cursor() as cursor:
                insert_query = (
                    """
                    INSERT INTO incrementum.stock_history
                    (
                        stock_symbol, day_and_time,
                        open_price, close_price,
                        high, low, volume, is_hourly
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (stock_symbol, day_and_time) DO UPDATE SET
                    open_price = EXCLUDED.open_price,
                    close_price = EXCLUDED.close_price,
                    high = EXCLUDED.high,
                    low = EXCLUDED.low,
                    volume = EXCLUDED.volume,
                    is_hourly = EXCLUDED.is_hourly
                    """
                )
                cursor.executemany(insert_query, records)

            self.logger.info(
                f"Saved {len(records)} history records for {ticker} to database"
            )
            return True

        except Exception as e:
            self.logger.error(
                f"Error saving history for {ticker} to database: {str(e)}"
            )
            return False

    def _is_data_current(
            self,
            df: pd.DataFrame,
            max_age_days: int = 1) -> bool:
        if df is None or df.empty:
            return False

        try:
            latest_date = pd.to_datetime(df['day_and_time']).max()
            latest_dt = latest_date.to_pydatetime()

            age = timezone.now() - latest_dt
            is_current = age.days <= max_age_days

            self.logger.info(
                f"Data age: {age.days} days - Current: {is_current}"
            )
            return is_current
        except Exception as e:
            self.logger.error(f"Error checking data currency: {str(e)}")
            return False

    def _get_fresh_data_since(
        self,
        ticker: str,
        start_date: datetime,
        interval: str = "1d"
    ) -> Optional[pd.DataFrame]:
        try:
            api_key = os.environ.get('POLYGON_API_KEY')
            if not api_key:
                self.logger.error("POLYGON_API_KEY not set")
                return None
            from polygon import RESTClient
            client = RESTClient(api_key)
            end_date = timezone.now()
            timespan = 'hour' if interval != '1d' else 'day'
            resp = client.get_aggs(
                ticker,
                1,
                timespan,
                start_date.strftime('%Y-%m-%d'),
                end_date.strftime('%Y-%m-%d'),
                limit=5000
            )
            self.logger.error(f"{start_date}:{end_date}")
            if not resp:
                return None
            # Build DataFrame
            data = [
                {
                    'day_and_time': pd.to_datetime(bar.timestamp, unit='ms'),
                    'Open': bar.open,
                    'Close': bar.close,
                    'High': bar.high,
                    'Low': bar.low,
                    'Volume': bar.volume
                }
                for bar in resp
            ]
            if not data:
                return None
            df = pd.DataFrame(data)
            return df
        except Exception as e:
            self.logger.error(
                f"Error fetching fresh data for {ticker} from Polygon: {str(e)}")
            return None

    def history(
        self,
        ticker: str,
        period: str = "1y",
        interval: str = "1d"
    ) -> Tuple[Optional[pd.DataFrame], dict]:
        """Get stock history using ORM models"""
        metadata = {
            "source": "orm",
            "records_count": 0,
            "is_current": True,
            "last_date": None
        }

        try:
            # Use ORM to get history - this will use API or database based on
            # settings
            history_df = self.get_db_history(
                ticker, is_hourly=(interval != "1d"))

            if history_df is not None and not history_df.empty:
                # Convert prices from cents to dollars for compatibility
                if 'Open' not in history_df.columns:
                    history_df['Open'] = history_df['open_price'] / 100
                    history_df['Close'] = history_df['close_price'] / 100
                    history_df['High'] = history_df['high'] / 100
                    history_df['Low'] = history_df['low'] / 100
                    history_df['Volume'] = history_df['volume']

                # Set index to day_and_time for compatibility with existing
                # code
                if 'day_and_time' in history_df.columns:
                    # Convert day_and_time strings to datetime objects
                    history_df['day_and_time'] = pd.to_datetime(
                        history_df['day_and_time'])
                    history_df = history_df.set_index('day_and_time')

                metadata["records_count"] = len(history_df)
                if len(history_df) > 0:
                    metadata["last_date"] = history_df.index.max().isoformat()

                self.logger.info(
                    f"Retrieved {len(history_df)} records via ORM for {ticker}")
                return history_df, metadata
            else:
                self.logger.warning(f"No history data found for {ticker}")
                return None, metadata

        except Exception as e:
            self.logger.error(
                f"Error getting history for {ticker} via ORM: {str(e)}")
            return None, metadata
