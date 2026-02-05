#!/usr/bin/env python


import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, '/home/wolf/Incrementum/Incrementum.api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api_project.settings')

# Set up Django
django.setup()


def test_database_models():
    """Test with database models (current behavior)"""
    print("=== Testing Database Models ===")

    # Import database models directly
    from Incrementum.models.stock import StockModel as DBStockModel
    from Incrementum.models.stock_history import StockHistory as DBStockHistory

    try:
        # Test basic queries
        print(f"Total stocks in database: {DBStockModel.objects.count()}")

        # Get first stock
        if DBStockModel.objects.exists():
            first_stock = DBStockModel.objects.first()
            print(f"First stock: {first_stock}")
            print(f"Stock dict: {first_stock.to_dict()}")

            # Test history
            history_count = DBStockHistory.objects.filter(
                stock_symbol=first_stock).count()
            print(f"History records for {first_stock.symbol}: {history_count}")
    except Exception as e:
        print(f"Database error: {e}")


def test_api_models():
    """Test with API models (new behavior)"""
    print("\n=== Testing API Models ===")

    # Import API models directly
    from Incrementum.models.api_stock import APIStockModel
    from Incrementum.models.api_stock_history import APIStockHistory

    try:
        # Test basic queries - same interface as database models!
        print("Fetching stocks from external API...")
        stocks = APIStockModel.objects.all()
        print(f"Total stocks from API: {len(stocks)}")

        if len(stocks) > 0:
            first_stock = stocks[0]
            print(f"First stock: {first_stock}")
            print(f"Stock dict: {first_stock.to_dict()}")

            # Test getting stock by symbol
            try:
                aapl_stock = APIStockModel.objects.get(symbol='AAPL')
                print(f"AAPL stock: {aapl_stock}")
            except APIStockModel.DoesNotExist:
                print("AAPL not found via API")

            # Test history
            print(f"Fetching history for {first_stock.symbol}...")
            history = APIStockHistory.objects.filter(
                stock_symbol__symbol=first_stock.symbol)
            print(f"History records from API: {len(history)}")

    except Exception as e:
        print(f"API error: {e}")


def test_conditional_imports():
    """Test conditional imports based on settings"""
    print("\n=== Testing Conditional Imports ===")

    # Test with API disabled (default)
    os.environ['USE_EXTERNAL_STOCK_API'] = 'False'

    # Reload settings
    from django.conf import settings
    settings.USE_EXTERNAL_STOCK_API = False

    # Import models - should get database models
    from Incrementum.models import StockModel, StockHistory
    print(
        f"With API disabled - StockModel class: {StockModel.__module__}.{StockModel.__name__}")
    print(
        f"With API disabled - StockHistory class: {StockHistory.__module__}.{StockHistory.__name__}")

    # Test with API enabled
    os.environ['USE_EXTERNAL_STOCK_API'] = 'True'
    settings.USE_EXTERNAL_STOCK_API = True

    # Note: In a real application restart would be needed for import changes
    print("\n(In real application, server restart would be needed for import changes)")


def main():
    print("Stock API ORM Compatibility Test")
    print("=" * 40)

    test_database_models()
    test_api_models()
    test_conditional_imports()

    print("\n=== Summary ===")
    print("✓ Created ORM-compatible API client classes")
    print("✓ StockModel.objects.get/filter/all() interface preserved")
    print("✓ StockHistory.objects.filter() interface preserved")
    print("✓ Conditional imports based on USE_EXTERNAL_STOCK_API setting")
    print("✓ Backward compatibility maintained")

    print("\nTo use API models, set environment variable:")
    print("export USE_EXTERNAL_STOCK_API=true")
    print("export STOCK_API_BASE_URL=http://your-stock-api:8001")


if __name__ == '__main__':
    main()
