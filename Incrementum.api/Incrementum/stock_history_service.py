from logging import Logger
from polygon import RESTClient
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
        try:
            query = """
                SELECT
                    stock_symbol,
                    day_and_time,
                    open_price,
                    close_price,
                    high,
                    low,
                    volume,
                    is_hourly
                FROM incrementum.stock_history
                WHERE stock_symbol = %s
            """
            params = [ticker]

            if start_date:
                query += " AND day_and_time >= %s"
                params.append(start_date)

            if end_date:
                query += " AND day_and_time <= %s"
                params.append(end_date)

            if is_hourly is not None:
                query += " AND is_hourly = %s"
                params.append(is_hourly)

            query += " ORDER BY day_and_time ASC"

            with connection.cursor() as cursor:
                cursor.execute(query, params)
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()

            if not rows:
                self.logger.info(
                    f"No database history found for ticker {ticker}"
                )
                return None

            df = pd.DataFrame(rows, columns=columns)
            self.logger.info(f"Retrieved {len(df)} records from database for {ticker}")
            return df

        except Exception as e:
            self.logger.error(
                f"Error fetching database history for {ticker}: {str(e)}"
            )
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

    def _is_data_current(self, df: pd.DataFrame, max_age_days: int = 1) -> bool:
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
                self.logger.error("POLYGON_API_KEY not set in environment")
                return None
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
            self.logger.error(f"Error fetching fresh data for {ticker} from Polygon: {str(e)}")
            return None

    def history(
        self,
        ticker: str,
        period: str = "1y",
        interval: str = "1d"
    ) -> Tuple[Optional[pd.DataFrame], dict]:
        metadata = {
            "source": None,
            "records_count": 0,
            "is_current": False,
            "last_date": None
        }

        db_history = self.get_db_history(ticker, is_hourly=(interval != "1d"))
        if db_history is not None and not db_history.empty:
            is_current = self._is_data_current(db_history)
            metadata["is_current"] = is_current
            last_dt = pd.to_datetime(db_history['day_and_time']).max()
            metadata["last_date"] = last_dt.isoformat()

            if is_current:
                metadata["source"] = "database"
                metadata["records_count"] = len(db_history)
                self.logger.info(f"Using current database history for {ticker}")
                return db_history, metadata

            latest_db_date = pd.to_datetime(db_history['day_and_time']).max().to_pydatetime()
            fresh_data = self._get_fresh_data_since(ticker, latest_db_date, interval)

            if fresh_data is not None and not fresh_data.empty:
                is_hourly = interval != "1d"
                self.save_history_to_db(ticker, fresh_data, is_hourly)

                combined = pd.concat([db_history, fresh_data])
                combined = combined.drop_duplicates(
                    subset=["day_and_time"], keep="last"
                )
                combined_data = (
                    combined.sort_values("day_and_time")
                    .reset_index(drop=True)
                )

                metadata["source"] = "combined"
                metadata["records_count"] = len(combined_data)
                metadata["is_current"] = True
                self.logger.info(
                    f"Using combined (database + fresh) history for {ticker}"
                )
                return combined_data, metadata
            else:
                metadata["source"] = "database_stale"
                metadata["records_count"] = len(db_history)
                return db_history, metadata

        try:
            api_key = os.environ.get('POLYGON_API_KEY')
            if not api_key:
                self.logger.error("POLYGON_API_KEY not set in environment")
                return None, metadata
            client = RESTClient(api_key)
            end_date = timezone.now()
            if period.endswith('d'):
                days = int(period[:-1])
                start_date = end_date - pd.Timedelta(days=days)
            elif period.endswith('y'):
                years = int(period[:-1])
                start_date = end_date - pd.DateOffset(years=years)
            else:
                start_date = end_date - pd.Timedelta(days=365)
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
                self.logger.warning(f"No history data found for ticker {ticker} from Polygon")
                return None, metadata
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
                self.logger.warning(f"No history data found for ticker {ticker} from Polygon (empty data)")
                return None, metadata
            df = pd.DataFrame(data)
            self.logger.error(df.head(25))
            is_hourly = interval != "1d"
            self.save_history_to_db(ticker, df, is_hourly)
            metadata["source"] = "polygon"
            metadata["records_count"] = len(df)
            metadata["is_current"] = True
            self.logger.info(f"Retrieved {len(df)} records from Polygon for {ticker}")
            return df, metadata
        except Exception as e:
            self.logger.error(f"Error fetching history for {ticker} from Polygon: {str(e)}")
            return None, metadata
