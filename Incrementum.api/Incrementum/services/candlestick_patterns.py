from typing import Dict, List, Tuple
import pandas as pd


class CandlestickData:
    """Normalized candlestick data structure"""
    
    def __init__(self, open_price: float, high: float, low: float, close_price: float):
        self.open = open_price
        self.high = high
        self.low = low
        self.close = close_price
        
        # Normalized components
        self.body_size = abs(close_price - open_price)
        self.upper_shadow = high - max(open_price, close_price)
        self.lower_shadow = min(open_price, close_price) - low
        self.total_range = high - low
        
        # Calculate ratios (avoid division by zero)
        self.body_ratio = self.body_size / self.total_range if self.total_range else 0
        self.upper_shadow_ratio = self.upper_shadow / self.total_range if self.total_range else 0
        self.lower_shadow_ratio = self.lower_shadow / self.total_range if self.total_range else 0
    
    def __repr__(self):
        return (f"CandlestickData(open={self.open}, high={self.high}, "
                f"low={self.low}, close={self.close})")


def is_hammer(candle: CandlestickData,
              body_ratio_max: float = 0.3,
              lower_shadow_ratio_min: float = 0.6,
              upper_shadow_ratio_max: float = 0.1) -> bool:
    """
    Detect Hammer candlestick pattern.

    A Hammer is characterized by:
    - Small body at the top (body ratio <= 30% of total range)
    - Long lower shadow (at least 60% of total range)
    - Little to no upper shadow (upper shadow <= 10% of total range)
    - Typically appears after a downtrend (bullish reversal signal)
    """
    return (
        candle.total_range > 0
        and candle.body_ratio <= body_ratio_max
        and candle.lower_shadow_ratio >= lower_shadow_ratio_min
        and candle.upper_shadow_ratio <= upper_shadow_ratio_max
    )


def is_hanging_man(candle: CandlestickData,
                   body_ratio_max: float = 0.3,
                   lower_shadow_ratio_min: float = 0.6,
                   upper_shadow_ratio_max: float = 0.1) -> bool:
    """
    Detect Hanging Man candlestick pattern.
    
    A Hanging Man has the same structure as a Hammer but appears in a different context:
    - Small body at the top (body ratio <= 30% of total range)
    - Long lower shadow (at least 60% of total range)
    - Little to no upper shadow (upper shadow <= 10% of total range)
    - Typically appears after an uptrend (bearish reversal signal)
    
    Note: The visual structure is identical to a Hammer. The difference is the
    trend context: Hammer appears after downtrend, Hanging Man after uptrend.
    """
    # Structurally identical to hammer
    return is_hammer(candle, body_ratio_max, lower_shadow_ratio_min, upper_shadow_ratio_max)


class CandlestickPatternAnalyzer:
    def __init__(self, data: pd.DataFrame):
        self.data = data
        self.candles: List[CandlestickData] = []
        self._normalize_data()

    def _normalize_data(self):
        self.candles = [
            CandlestickData(
                open_price=row['Open'],
                high=row['High'],
                low=row['Low'],
                close_price=row['Close']
            )
            for _, row in self.data.iterrows()
        ]

    def find_hammers(self) -> List[Tuple[int, CandlestickData]]:
        return [(idx, candle) for idx, candle in enumerate(self.candles) if is_hammer(candle)]

    def find_hanging_men(self) -> List[Tuple[int, CandlestickData]]:
        return [(idx, candle) for idx, candle in enumerate(self.candles) if is_hanging_man(candle)]

    def _pattern_to_dict(self, idx: int, candle: CandlestickData) -> Dict:
        """Convert a pattern match to a dictionary representation."""
        return {
            'index': idx,
            'date': str(self.data.index[idx]) if hasattr(self.data.index[idx], '__str__') else idx,
            'open': candle.open,
            'high': candle.high,
            'low': candle.low,
            'close': candle.close,
            'body_ratio': round(candle.body_ratio, 3),
            'lower_shadow_ratio': round(candle.lower_shadow_ratio, 3),
            'upper_shadow_ratio': round(candle.upper_shadow_ratio, 3),
        }

    def analyze_patterns(self) -> Dict[str, List[Dict]]:
        return {
            'hammers': [
                self._pattern_to_dict(idx, candle) for idx, candle in self.find_hammers()
            ],
            'hanging_men': [
                self._pattern_to_dict(idx, candle) for idx, candle in self.find_hanging_men()
            ]
        }
