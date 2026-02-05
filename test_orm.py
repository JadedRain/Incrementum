#!/usr/bin/env python
import os
import sys
import django

# Add the current directory to Python path
sys.path.insert(0, '/Incrementum.api')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api_project.settings')
django.setup()


def test_orm_setup():
    print("=== Testing ORM Setup ===")

    # Check settings
    from django.conf import settings
    use_external = getattr(settings, 'USE_EXTERNAL_STOCK_API', False)
    base_url = getattr(settings, 'STOCK_API_BASE_URL', 'not set')
    print(f"USE_EXTERNAL_STOCK_API: {use_external}")
    print(f"STOCK_API_BASE_URL: {base_url}")
    print()

    # Test imports
    try:
        from Incrementum.models import StockModel
        print(f"Successfully imported StockModel: {StockModel}")
        print(f"StockModel class: {StockModel.__class__}")
        print(f"StockModel module: {StockModel.__module__}")
        print()

        # Test manager
        manager = StockModel.objects
        print(f"Manager: {manager}")
        print(f"Manager class: {manager.__class__}")
        print()

        # Test basic query
        try:
            print("Testing StockModel.objects.all()...")
            stocks = StockModel.objects.all()
            print(f"Query result type: {type(stocks)}")
            print(f"Number of stocks: {len(stocks)}")

            if len(stocks) > 0:
                first_stock = stocks[0]
                print(f"First stock: {first_stock}")
                print(f"First stock type: {type(first_stock)}")
                if hasattr(first_stock, 'symbol'):
                    print(f"First stock symbol: {first_stock.symbol}")
            else:
                print("No stocks returned")
        except Exception as e:
            print(f"Error querying stocks: {e}")
            import traceback
            traceback.print_exc()

    except ImportError as e:
        print(f"Import error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_orm_setup()
