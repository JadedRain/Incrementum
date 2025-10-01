from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from hello.models import CategoricalFilter, NumericFilter
from hello.utils import get_unique_sectors, get_unique_industries
from pathlib import Path


@csrf_exempt
@require_http_methods(["GET"])
def get_categorical_filter_types(request):
    """
    Get all available categorical filter types
    """
    try:
        filters = CategoricalFilter.objects.all().values_list('name', flat=True)
        return JsonResponse({
            'categorical_filters': list(filters)
        }, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_numeric_filter_types(request):
    """
    Get all available numeric filter types
    """
    try:
        filters = NumericFilter.objects.all().values_list('name', flat=True)
        return JsonResponse({
            'numeric_filters': list(filters)
        }, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_categorical_filter_values(request, filter_name):
    """
    Get possible values for a specific categorical filter
    
    For example: /filter-values/sector/ returns all available sectors
    """
    try:
        # Check if the filter exists
        if not CategoricalFilter.objects.filter(name=filter_name).exists():
            return JsonResponse({"error": f"Filter '{filter_name}' not found"}, status=404)
        
        csv_path = Path(__file__).resolve().parent / 'data' / 'ticker_info.csv'
        values = []
        
        if filter_name == 'sector':
            try:
                values = get_unique_sectors(csv_path)
            except Exception as e:
                values = ['Technology', 'Healthcare', 'Financials', 'Consumer Discretionary', 
                         'Communication Services', 'Industrials', 'Consumer Staples', 
                         'Energy', 'Utilities', 'Real Estate', 'Materials']
                         
        elif filter_name == 'industry':
            try:
                values = get_unique_industries(csv_path)
            except Exception as e:
                values = ['Software', 'Biotechnology', 'Banks', 'Semiconductors', 
                         'Oil & Gas', 'Pharmaceuticals', 'Retail', 'Insurance',
                         'Aerospace & Defense', 'Telecommunications']
                         
        elif filter_name == 'exchange':
            values = ['NYSE', 'NASDAQ', 'AMEX', 'OTC', 'TSX', 'LSE']
            
        elif filter_name == 'country':
            values = ['USA', 'Canada', 'UK', 'Germany', 'Japan', 'Australia', 'France', 'China']
            
        elif filter_name == 'market_cap_category':
            values = ['Mega Cap', 'Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap', 'Nano Cap']
            
        elif filter_name == 'dividend_yield_category':
            values = ['High Yield (>4%)', 'Medium Yield (2-4%)', 'Low Yield (<2%)', 'No Dividend']
            
        else:
            return JsonResponse({"error": f"No predefined values for filter '{filter_name}'"}, status=400)
        
        return JsonResponse({
            'filter_name': filter_name,
            'values': values,
            'count': len(values)
        }, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_all_filter_options(request):
    """
    Get all filter types and their possible values in one request
    """
    try:
        # Get categorical filters
        categorical_filters = CategoricalFilter.objects.all().values_list('name', flat=True)
        
        # Get numeric filters  
        numeric_filters = NumericFilter.objects.all().values_list('name', flat=True)
        
        # Get values for each categorical filter
        categorical_options = {}
        csv_path = Path(__file__).resolve().parent / 'data' / 'ticker_info.csv'
        
        for filter_name in categorical_filters:
            if filter_name == 'sector':
                try:
                    categorical_options[filter_name] = get_unique_sectors(csv_path)
                except:
                    categorical_options[filter_name] = ['Technology', 'Healthcare', 'Financials']
                    
            elif filter_name == 'industry':
                try:
                    categorical_options[filter_name] = get_unique_industries(csv_path)
                except:
                    categorical_options[filter_name] = ['Software', 'Biotechnology', 'Banks']
                    
            elif filter_name == 'exchange':
                categorical_options[filter_name] = ['NYSE', 'NASDAQ', 'AMEX', 'OTC']
                
            elif filter_name == 'country':
                categorical_options[filter_name] = ['USA', 'Canada', 'UK', 'Germany']
                
            elif filter_name == 'market_cap_category':
                categorical_options[filter_name] = ['Large Cap', 'Mid Cap', 'Small Cap', 'Micro Cap']
                
            elif filter_name == 'dividend_yield_category':
                categorical_options[filter_name] = ['High Yield', 'Medium Yield', 'Low Yield', 'No Dividend']
        
        return JsonResponse({
            'categorical_filters': categorical_options,
            'numeric_filters': list(numeric_filters)
        }, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)