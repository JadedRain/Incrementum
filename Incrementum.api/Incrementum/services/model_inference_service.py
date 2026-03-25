import json
import logging
import os
import numpy as np
from keras.models import load_model
from Incrementum.stock_history_service import StockHistoryService
from Incrementum.models.stock import StockModel

logger = logging.getLogger(__name__)


class ModelInferenceService:
    """Service for loading Keras model, managing normalization, and running predictions."""

    def __init__(self, model_path=None, metadata_path=None):
        """
        Initialize the model inference service.

        Args:
            model_path: Path to .keras model file.
            metadata_path: Path to metadata JSON file.
        """
        if model_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(
                base_dir, '..', 'ai', 'final_model_20260325_141441.keras'
            )

        if metadata_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            metadata_path = os.path.join(
                base_dir, '..', 'ai', 'final_model_20260325_141441_metadata.json'
            )

        self.model_path = model_path
        self.metadata_path = metadata_path
        self.model = None
        self.metadata = None
        self.symbol_to_id = None
        self.history_service = StockHistoryService()

        self._load_model()
        self._load_metadata()
        self._build_symbol_map()

    def _load_model(self):
        """Load Keras model from disk."""
        try:
            self.model = load_model(self.model_path)
            logger.info(f"Model loaded successfully from {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load model from {self.model_path}: {str(e)}")
            raise

    def _load_metadata(self):
        """Load metadata JSON file with normalization parameters."""
        try:
            with open(self.metadata_path, 'r') as f:
                self.metadata = json.load(f)
            logger.info(f"Metadata loaded from {self.metadata_path}")
        except FileNotFoundError:
            logger.error(f"Metadata file not found at {self.metadata_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse metadata JSON: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Failed to load metadata: {str(e)}")
            raise

    def _build_symbol_map(self):
        """Build dynamic symbol-to-ID mapping from current database stocks."""
        try:
            stocks = list(StockModel.objects.all().values_list('symbol', flat=True))
            self.symbol_to_id = {symbol: idx for idx, symbol in enumerate(sorted(stocks))}
            logger.info(f"Built symbol map with {len(self.symbol_to_id)} symbols")
        except Exception as e:
            logger.error(f"Failed to build symbol map: {str(e)}")
            raise

    def get_prediction(self, ticker):
        """
        Get model prediction for a stock symbol.

        Args:
            ticker: Stock symbol (e.g., 'AAPL')

        Returns:
            dict with prediction results

        Raises:
            ValueError: If ticker not found or insufficient data
            RuntimeError: If model inference fails
        """
        ticker_upper = ticker.upper()

        # Validate ticker exists in symbol map
        if ticker_upper not in self.symbol_to_id:
            raise ValueError(f"Ticker {ticker} not found in database")

        # Fetch 24 hourly records
        df = self.history_service.get_db_history(
            ticker_upper,
            is_hourly=True
        )

        if df is None or df.empty:
            raise ValueError(f"No data available for {ticker}")

        # Ensure we have exactly 24 records (lookback)
        lookback = self.metadata.get('lookback', 24)
        if len(df) < lookback:
            raise ValueError(
                f"Insufficient data for {ticker}: got {len(df)} records, need {lookback}"
            )

        # Use the most recent lookback records
        df = df.tail(lookback).reset_index(drop=True)

        try:
            # Prepare inputs
            feature_input = self._prepare_features(df)
            symbol_id = self.symbol_to_id[ticker_upper]
            symbol_input = self._prepare_symbol_input(symbol_id, lookback)

            # Run inference
            pred_norm = self.model.predict([feature_input, symbol_input], verbose=0)
            pred_norm_value = float(pred_norm[0][0])

            # Denormalize prediction
            ret_mean = self.metadata['ret_mean']
            ret_std = self.metadata['ret_std']
            pred_log_return = (pred_norm_value * ret_std) + ret_mean

            # Get last close price (most recent, in cents)
            last_close_cents = df.iloc[-1]['close_price']
            last_close_usd = float(last_close_cents) / 100

            # Calculate predicted price
            predicted_price = last_close_usd * np.exp(pred_log_return)

            # Get timestamp of last data point
            last_timestamp = df.iloc[-1]['day_and_time']

            return {
                'symbol': ticker_upper,
                'last_close': last_close_usd,
                'predicted_price': float(predicted_price),
                'predicted_log_return': float(pred_log_return),
                'predicted_log_return_norm': float(pred_norm_value),
                'lookback_end_time': str(last_timestamp),
                'model_version': self.metadata.get('training_date', 'unknown'),
                'lookback_periods': lookback,
                'data_records_used': len(df),
            }

        except Exception as e:
            logger.error(f"Error during inference for {ticker}: {str(e)}")
            raise RuntimeError(f"Inference failed for {ticker}: {str(e)}")

    def _prepare_features(self, df):
        """
        Prepare normalized feature input from dataframe.

        Args:
            df: DataFrame with OHLCV data

        Returns:
            np.array of shape (1, lookback, num_features)
        """
        lookback = len(df)
        num_features = 5
        features = np.zeros((1, lookback, num_features), dtype=np.float32)

        # Extract feature stats from metadata
        feature_stats = self.metadata['feature_stats']

        # Feature list: log_open, log_high, log_low, log_close, log_volume
        feature_names = ['log_open', 'log_high', 'log_low', 'log_close', 'log_volume']

        for t in range(lookback):
            row = df.iloc[t]

            # Convert from cents to dollars, then to log scale
            open_usd = float(row['open_price']) / 100
            high_usd = float(row['high']) / 100
            low_usd = float(row['low']) / 100
            close_usd = float(row['close_price']) / 100
            volume = float(row['volume'])

            # Compute log values
            log_open = np.log(max(open_usd, 1e-12))
            log_high = np.log(max(high_usd, 1e-12))
            log_low = np.log(max(low_usd, 1e-12))
            log_close = np.log(max(close_usd, 1e-12))
            log_volume = np.log1p(max(volume, 0))

            raw_features = [log_open, log_high, log_low, log_close, log_volume]

            # Normalize each feature
            for feat_idx, feat_name in enumerate(feature_names):
                raw_val = raw_features[feat_idx]
                stats = feature_stats[feat_name]
                mean, std = stats[0], stats[1]

                normalized = (raw_val - mean) / std if std > 0 else 0
                features[0, t, feat_idx] = float(normalized)

        # Validate all values are finite
        if not np.all(np.isfinite(features)):
            msg = "Non-finite values in feature input after normalization"
            raise ValueError(msg)

        return features

    def _prepare_symbol_input(self, symbol_id, lookback):
        """
        Prepare symbol input (repeated symbol ID for all timesteps).

        Args:
            symbol_id: Integer ID for the symbol
            lookback: Number of timesteps

        Returns:
            np.array of shape (1, lookback) with symbol_id repeated
        """
        symbol_input = np.full((1, lookback), symbol_id, dtype=np.int32)
        return symbol_input
