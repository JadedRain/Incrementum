# Import all models for backward compatibility
from .account import Account
from .blacklist import Blacklist
from .categorical_filter import CategoricalFilter
from .custom_collection import CustomCollection
from .custom_collection_stock import CustomCollectionStock
from .custom_screener import CustomScreener
from .custom_screener_categorical import CustomScreenerCategorical
from .custom_screener_numeric import CustomScreenerNumeric
from .numeric_filter import NumericFilter
from .screener import Screener
from .user_stock_potential import UserStockPotential

# Conditional import based on configuration
from django.conf import settings

if getattr(settings, 'USE_EXTERNAL_STOCK_API', False):
    # Use API-backed models
    from .api_stock import APIStockModel as StockModel, APIStock as Stock
    from .api_stock_history import APIStockHistory as StockHistory
else:
    # Use database models
    from .stock import StockModel, Stock
    from .stock_history import StockHistory

__all__ = [
    'Account',
    'Blacklist',
    'CategoricalFilter',
    'CustomCollection',
    'CustomCollectionStock',
    'CustomScreener',
    'CustomScreenerCategorical',
    'CustomScreenerNumeric',
    'NumericFilter',
    'Screener',
    'Stock',
    'StockModel',
    'StockHistory',
    'UserStockPotential',
]
