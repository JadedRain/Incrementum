"""
Tests for Candlestick Pattern Detection

Tests the hammer and hanging man pattern detection functions.
"""
import pandas as pd
from Incrementum.services.candlestick_patterns import (
    CandlestickData,
    is_hammer,
    is_hanging_man,
    CandlestickPatternAnalyzer
)


class TestCandlestickData:
    """Test the CandlestickData normalization"""

    def test_candlestick_data_normalization(self):
        """Test that candlestick data is properly normalized"""
        candle = CandlestickData(open_price=100, high=110, low=90, close_price=105)

        assert candle.body_size == 5  # abs(105 - 100)
        assert candle.upper_shadow == 5  # 110 - max(100, 105)
        assert candle.lower_shadow == 10  # min(100, 105) - 90
        assert candle.total_range == 20  # 110 - 90
        assert candle.body_ratio == 0.25  # 5 / 20
        assert candle.upper_shadow_ratio == 0.25  # 5 / 20
        assert candle.lower_shadow_ratio == 0.5  # 10 / 20

    def test_candlestick_data_zero_range(self):
        """Test handling of zero range (doji-like candles)"""
        candle = CandlestickData(open_price=100, high=100, low=100, close_price=100)

        assert candle.total_range == 0
        assert candle.body_ratio == 0
        assert candle.upper_shadow_ratio == 0
        assert candle.lower_shadow_ratio == 0


class TestHammerPattern:
    """Test Hammer candlestick pattern detection"""

    def test_hammer_positive_case(self):
        """Test a valid hammer pattern"""
        # Classic hammer: small body at top, long lower shadow, minimal upper shadow
        # Open=100, High=102, Low=85, Close=101
        # Body: 1 (1%), Upper shadow: 1 (1%), Lower shadow: 15 (88%), Total: 17
        candle = CandlestickData(open_price=100, high=102, low=85, close_price=101)

        assert is_hammer(candle) is True
        assert candle.body_ratio < 0.3
        assert candle.lower_shadow_ratio > 0.6
        assert candle.upper_shadow_ratio < 0.1

    def test_hammer_negative_large_body(self):
        """Test that large body candles are not detected as hammers"""
        # Large body: Open=90, High=105, Low=85, Close=105
        # Body: 15 (75%), Lower shadow: 5 (25%), Upper shadow: 0
        candle = CandlestickData(open_price=90, high=105, low=85, close_price=105)

        assert is_hammer(candle) is False
        # Body is too large (75% > 30%)

    def test_hammer_negative_short_lower_shadow(self):
        """Test that candles without long lower shadow are not hammers"""
        # Short lower shadow: Open=100, High=110, Low=98, Close=102
        # Body: 2 (17%), Upper shadow: 8 (67%), Lower shadow: 2 (17%)
        candle = CandlestickData(open_price=100, high=110, low=98, close_price=102)

        assert is_hammer(candle) is False
        # Lower shadow is too short (17% < 60%)

    def test_hammer_negative_long_upper_shadow(self):
        """Test that candles with long upper shadow are not hammers"""
        # Long upper shadow: Open=100, High=120, Low=90, Close=102
        # Body: 2 (7%), Upper shadow: 18 (60%), Lower shadow: 10 (33%)
        candle = CandlestickData(open_price=100, high=120, low=90, close_price=102)

        assert is_hammer(candle) is False
        # Upper shadow is too long (60% > 10%)

    def test_hammer_zero_range_candle(self):
        """Test that zero-range candles are not hammers"""
        candle = CandlestickData(open_price=100, high=100, low=100, close_price=100)

        assert is_hammer(candle) is False

    def test_hammer_bullish_vs_bearish_body(self):
        """Test that hammer pattern works for both bullish and bearish bodies"""
        # Bullish hammer (close > open)
        bullish_candle = CandlestickData(open_price=100, high=102, low=85, close_price=101)
        assert is_hammer(bullish_candle) is True

        # Bearish hammer (close < open)
        bearish_candle = CandlestickData(open_price=101, high=102, low=85, close_price=100)
        assert is_hammer(bearish_candle) is True


class TestHangingManPattern:
    """Test Hanging Man candlestick pattern detection"""

    def test_hanging_man_positive_case(self):
        """Test a valid hanging man pattern"""
        # Classic hanging man: structurally identical to hammer
        # Open=100, High=102, Low=85, Close=101
        candle = CandlestickData(open_price=100, high=102, low=85, close_price=101)

        assert is_hanging_man(candle) is True
        assert candle.body_ratio < 0.3
        assert candle.lower_shadow_ratio > 0.6
        assert candle.upper_shadow_ratio < 0.1

    def test_hanging_man_negative_large_body(self):
        """Test that large body candles are not hanging man"""
        # Large body candle
        candle = CandlestickData(open_price=90, high=105, low=85, close_price=105)

        assert is_hanging_man(candle) is False

    def test_hanging_man_negative_short_lower_shadow(self):
        """Test that candles without long lower shadow are not hanging man"""
        candle = CandlestickData(open_price=100, high=110, low=98, close_price=102)

        assert is_hanging_man(candle) is False

    def test_hanging_man_negative_long_upper_shadow(self):
        """Test that candles with long upper shadow are not hanging man"""
        candle = CandlestickData(open_price=100, high=120, low=90, close_price=102)

        assert is_hanging_man(candle) is False

    def test_hanging_man_structural_equivalence(self):
        # Same candle should match both patterns (context differentiates them)
        candle = CandlestickData(open_price=100, high=102, low=85, close_price=101)

        assert is_hammer(candle) is True
        assert is_hanging_man(candle) is True


class TestCandlestickPatternAnalyzer:
    def test_analyzer_with_hammer_data(self):
        # Create sample data with one hammer
        data = pd.DataFrame({
            'Open': [100, 100, 90],
            'High': [110, 102, 105],
            'Low': [95, 85, 85],
            'Close': [105, 101, 105]
        })

        analyzer = CandlestickPatternAnalyzer(data)
        hammers = analyzer.find_hammers()

        # Second candle (index 1) is a hammer
        assert len(hammers) >= 1
        assert any(idx == 1 for idx, _ in hammers)

    def test_analyzer_with_no_patterns(self):
        # Regular candles without hammer/hanging man characteristics
        data = pd.DataFrame({
            'Open': [100, 100, 100],
            'High': [105, 105, 105],
            'Low': [95, 95, 95],
            'Close': [104, 96, 102]
        })

        analyzer = CandlestickPatternAnalyzer(data)
        result = analyzer.analyze_patterns()

        # These regular candles shouldn't match hammer pattern
        # (body ~40-80%, no long lower shadow)
        assert len(result['hammers']) == 0
        assert len(result['hanging_men']) == 0

    def test_analyzer_normalization(self):
        data = pd.DataFrame({
            'Open': [100],
            'High': [110],
            'Low': [90],
            'Close': [105]
        })

        analyzer = CandlestickPatternAnalyzer(data)

        assert len(analyzer.candles) == 1
        candle = analyzer.candles[0]
        assert candle.open == 100
        assert candle.high == 110
        assert candle.low == 90
        assert candle.close == 105

    def test_analyze_patterns_structure(self):
        data = pd.DataFrame({
            'Open': [100, 100],
            'High': [102, 110],
            'Low': [85, 95],
            'Close': [101, 105]
        })

        analyzer = CandlestickPatternAnalyzer(data)
        result = analyzer.analyze_patterns()

        assert 'hammers' in result
        assert 'hanging_men' in result
        assert isinstance(result['hammers'], list)
        assert isinstance(result['hanging_men'], list)

        # Check structure of pattern results
        if len(result['hammers']) > 0:
            hammer = result['hammers'][0]
            assert 'index' in hammer
            assert 'date' in hammer
            assert 'open' in hammer
            assert 'high' in hammer
            assert 'low' in hammer
            assert 'close' in hammer
            assert 'body_ratio' in hammer
            assert 'lower_shadow_ratio' in hammer
            assert 'upper_shadow_ratio' in hammer

    def test_analyzer_with_multiple_patterns(self):
        data = pd.DataFrame({
            'Open': [100, 100, 100],
            'High': [102, 103, 101.5],
            'Low': [85, 84, 85],
            'Close': [101, 102, 100.5]
        })

        analyzer = CandlestickPatternAnalyzer(data)
        hammers = analyzer.find_hammers()

        # All three should be hammers (small body, long lower shadow, small upper shadow)
        assert len(hammers) == 3


class TestEdgeCases:
    def test_exact_threshold_values(self):
        # Candle exactly at body ratio threshold (30%)
        # Open=100, High=110, Low=90, Close=106
        # Body: 6 (30%), Lower shadow: 10 (50%), Upper shadow: 4 (20%)
        candle = CandlestickData(open_price=100, high=110, low=90, close_price=106)

        # Should fail because upper shadow is 20% > 10%
        assert is_hammer(candle) is False

        # Adjust to pass: Open=100, High=101.5, Low=85, Close=100.5
        # Body: 0.5 (3%), Lower shadow: 15 (94%), Upper shadow: 1 (6%)
        passing_candle = CandlestickData(open_price=100, high=101.5, low=85, close_price=100.5)
        assert is_hammer(passing_candle) is True

    def test_very_small_candle(self):
        # Very small candle but maintains hammer proportions
        candle = CandlestickData(open_price=100.00, high=100.10, low=99.00, close_price=100.02)

        # Body: 0.02 (1.8%), Lower shadow: 1.00 (90.9%), Upper shadow: 0.08 (7.3%)
        assert is_hammer(candle) is True

    def test_very_large_candle(self):
        """Test with very large price ranges"""
        # Large price movements maintaining hammer proportions
        candle = CandlestickData(open_price=1000, high=1020, low=850, close_price=1010)

        # Body: 10 (5.9%), Lower shadow: 150 (88.2%), Upper shadow: 10 (5.9%)
        assert is_hammer(candle) is True
