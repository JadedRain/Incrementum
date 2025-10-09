from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .utils import get_unique_sectors, get_unique_industries


class FiltersController:
    @csrf_exempt
    @require_http_methods(["GET"])
    def get_sectors(request):
        """
        Retrieve all unique sectors from the ticker data.
        
        Args:
            request: HTTP request object
            
        Returns:
            JsonResponse: JSON response containing sectors list or error
        """
        try:
            csv_path = Path(__file__).resolve().parent / 'data' / 'ticker_info.csv'
            sectors = get_unique_sectors(csv_path)
            return JsonResponse({'sectors': sectors})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    @csrf_exempt
    @require_http_methods(["GET"])
    def get_industries(request):
        """
        Retrieve all unique industries from the ticker data.
        
        Args:
            request: HTTP request object
            
        Returns:
            JsonResponse: JSON response containing industries list or error
        """
        try:
            csv_path = Path(__file__).resolve().parent / 'data' / 'ticker_info.csv'
            industries = get_unique_industries(csv_path)
            return JsonResponse({'industries': industries})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)