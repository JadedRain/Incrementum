# CNN Walk-Forward Model Specification

## Model Architecture
- Type: Multi-input CNN for time-series stock return prediction
- Framework: Keras/TensorFlow
- Task: Predict normalized log returns for the next trading period
- File format: `.keras`

## Inputs

### Input 1: Feature Input
- **Name**: `feature_input`
- **Shape**: `(batch_size, lookback, num_features)`
- **Data type**: `float32`
- **Lookback**: Default = 24 (number of historical periods)
- **Num features**: 5
  - `log_open`: log(open_price)
  - `log_high`: log(high_price)
  - `log_low`: log(low_price)
  - `log_close`: log(close_price)
  - `log_volume`: log1p(volume)
- **Normalization**: Each feature MUST be normalized using formula: `(value - feature_mean) / feature_std`
- **Validity check**: All values must be finite (no NaN or inf)

### Input 2: Symbol Input
- **Name**: `symbol_input`
- **Shape**: `(batch_size, lookback)`
- **Data type**: `int32`
- **Values**: Symbol ID (0 to num_symbols-1)
- **Notes**: Same symbol ID repeated for all lookback timesteps
- **Example**: If AAPL is symbol_id=0, then symbol_input = [0, 0, 0, ..., 0] (repeated 24 times for lookback=24)

## Output

### Model Output
- **Name**: `predicted_log_return_norm`
- **Shape**: `(batch_size, 1)`
- **Data type**: `float32`
- **Range**: Typically [-2.0, 2.0]
- **Meaning**: Normalized log return prediction (z-score)
- **Formula**: output = (predicted_log_return - ret_mean) / ret_std

## Denormalization (Converting predictions back to real values)

### Step 1: Denormalize log return
```
log_return_raw = (log_return_norm * ret_std) + ret_mean
```

### Step 2: Convert to price
```
predicted_price = previous_close_price * exp(log_return_raw)
```

### Required Parameters (stored during training)
- `ret_mean`: Mean of log returns from training period (float)
- `ret_std`: Standard deviation of log returns from training period (float)
- `feature_stats`: Dictionary mapping feature names to (mean, std) tuples

## Example Usage

### Inference Code
```python
import numpy as np
from keras.models import load_model

# Load model and normalization parameters
model = load_model("models/final_model_20260325_143022.keras")
ret_mean = 0.00234      # From training
ret_std = 0.01567       # From training
feature_stats = {       # From training
    "log_open": (5.234, 0.456),
    "log_high": (5.245, 0.458),
    "log_low": (5.223, 0.455),
    "log_close": (5.234, 0.456),
    "log_volume": (10.456, 1.234),
}

# Prepare inputs
batch_size = 1
lookback = 24
num_features = 5
symbol_id = 0  # AAPL

# Create feature_input: shape (1, 24, 5)
feature_input = np.array([[
    [log_open_norm, log_high_norm, log_low_norm, log_close_norm, log_volume_norm],
    # ... repeat 24 times
]])

# Create symbol_input: shape (1, 24)
symbol_input = np.full((1, lookback), symbol_id, dtype=np.int32)

# Predict
pred_norm = model.predict([feature_input, symbol_input], verbose=0)  # shape (1, 1)
pred_norm_value = float(pred_norm[0][0])

# Denormalize
pred_log_return = (pred_norm_value * ret_std) + ret_mean
pred_close = previous_close_price * np.exp(pred_log_return)

print(f"Predicted log return: {pred_log_return}")
print(f"Predicted close price: {pred_close}")
```

## Batch Prediction
```python
# Multiple samples
batch_size = 32
feature_input = np.random.randn(batch_size, lookback, num_features)  # shape (32, 24, 5)
symbol_input = np.full((batch_size, lookback), symbol_id, dtype=np.int32)  # shape (32, 24)

predictions = model.predict([feature_input, symbol_input], verbose=0)  # shape (32, 1)
```

## Training Parameters
```yaml
lookback: 24
epochs: 20
batch_size: 32
symbol_embedding_dim: 8
learning_rate: 0.001
optimizer: Adam
loss: MSE
```

## Preprocessing Pipeline
1. Fetch raw price data (open, high, low, close, volume)
2. Calculate log values: `log_column = log(column.clip(lower=1e-12))`
3. Calculate log_volume: `log_volume = log1p(volume.clip(lower=0))`
4. Calculate log_return: `log_return = log(close).diff()`
5. Calculate training statistics (mean, std) from training period only
6. Normalize all features: `feature_norm = (feature - mean) / std`
7. Normalize log_return: `log_return_norm = (log_return - ret_mean) / ret_std`
8. Create sequences of length lookback with corresponding symbol IDs
9. Filter for finite values only

## Model Metadata
To support reloading with correct normalization parameters, save alongside model:
```python
import json

metadata = {
    "lookback": 24,
    "num_features": 5,
    "num_symbols": 42,
    "symbol_embedding_dim": 8,
    "ret_mean": float(ret_mean),
    "ret_std": float(ret_std),
    "feature_stats": {
        "log_open": [float(mean), float(std)],
        "log_high": [float(mean), float(std)],
        "log_low": [float(mean), float(std)],
        "log_close": [float(mean), float(std)],
        "log_volume": [float(mean), float(std)],
    },
    "symbol_id_map": {symbol: int(idx) for symbol, idx in symbol_to_id.items()},
    "training_date": "2026-03-25",
    "interval": "1h",
}

with open("models/final_model_20260325_143022_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)
```

## Error Handling
- **Invalid input shape**: Check batch_size, lookback, num_features dimensions
- **Non-finite values**: Filter out NaN/inf before prediction
- **Normalization mismatch**: Use exact ret_mean/ret_std and feature_stats from training
- **Symbol ID out of range**: Symbol ID must be 0 <= id < num_symbols
