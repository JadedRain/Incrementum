from datetime import datetime, timedelta
from logging import Logger
from typing import Optional, Tuple
import pandas as pd
from django.db import connection
from django.utils import timezone


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
                query += " AND day_and_time < %s"
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

    def _is_data_current(self, df: pd.DataFrame, max_age_days: int = 1) -> bool:
        if df is None or df.empty:
            return False

        try:
            latest_date = pd.to_datetime(df['day_and_time']).max()
            latest_dt = latest_date.to_pydatetime()

            if latest_dt.tzinfo is None:
                latest_dt = timezone.make_aware(latest_dt, timezone.get_current_timezone())

            age = timezone.now() - latest_dt
            is_current = age.days <= max_age_days

            self.logger.info(
                f"Data age: {age.days} days - Current: {is_current}"
            )
            return is_current
        except Exception as e:
            self.logger.error(f"Error checking data currency: {str(e)}")
            return False

    def _aggregate_daily(self, df: pd.DataFrame) -> Optional[pd.DataFrame]:
        if df is None or df.empty:
            return None

        try:
            work = df.copy()
            work["day_and_time"] = pd.to_datetime(work["day_and_time"])
            work = work.sort_values("day_and_time")
            work = work.set_index("day_and_time")

            daily = work.resample("1D").agg({
                "open_price": "first",
                "close_price": "last",
                "high": "max",
                "low": "min",
                "volume": "sum",
            })

            daily = daily.dropna(subset=["open_price", "close_price", "high", "low"]).reset_index()
            daily["is_hourly"] = True

            return daily
        except Exception as e:
            self.logger.error(f"Error aggregating daily data: {str(e)}")
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
        end_date = datetime.now()
        start_date = self.calculate_start_date(period, end_date)

        if interval == "1d":
            db_history = self.get_db_history(
                ticker,
                start_date=start_date.strftime("%Y-%m-%d"),
                end_date=end_date.strftime("%Y-%m-%d"),
                is_hourly=True,
            )
            if db_history is None or db_history.empty:
                minute_history = self.get_db_history(
                    ticker,
                    start_date=start_date.strftime("%Y-%m-%d"),
                    end_date=end_date.strftime("%Y-%m-%d"),
                    is_hourly=False,
                )
                if minute_history is not None and not minute_history.empty:
                    db_history = self._aggregate_daily(minute_history)
        else:
            db_history = self.get_db_history(
                ticker,
                start_date=start_date.strftime("%Y-%m-%d"),
                end_date=end_date.strftime("%Y-%m-%d"),
                is_hourly=False,
            )

        if db_history is not None and not db_history.empty:
            is_current = self._is_data_current(db_history)
            metadata["is_current"] = is_current
            metadata["source"] = "database"
            metadata["records_count"] = len(db_history)
            last_dt = pd.to_datetime(db_history["day_and_time"]).max()
            metadata["last_date"] = last_dt.isoformat()
            self.logger.info(f"Using database history for {ticker}")
            return db_history, metadata

        return None, metadata

    def calculate_start_date(self, period, end_date):
        if period == "1Y":
            start_date = end_date - timedelta(days=365)
        elif period == "1d":
            start_date = end_date - timedelta(hours=24)
        elif period == "ytd":
            start_date = datetime(datetime.now().year, 1, 1)
        elif period == "1wk":
            start_date = end_date - timedelta(days=7)
        elif period == "3mo":
            start_date = end_date - timedelta(days=90)
        elif period == "1mo":
            start_date = end_date - timedelta(days=30)
        return start_date
