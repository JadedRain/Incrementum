from .get_stock_info import get_stock_info, search_stocks
from rest_framework import status
from rest_framework.decorators import api_view
from .watchlist_service import WatchlistService
from .get_stock_info import get_stock_info
from .get_stock_info import get_stock_by_ticker, generate_stock_graph
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import yfinance as yf
import logging
from django.http import HttpResponse
# Configure logging



class SearchStocksView(APIView):
	def __init__(self):
		logging.basicConfig(
    	level=logging.INFO,  # Minimum level to capture (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    	format="%(asctime)s - %(levelname)s - %(message)s")


	def get(self, request, query, page):
		results = search_stocks(query, page)
		logging.info(f"results: {results}")
		return Response(results)


# Singleton instance for demo (not thread-safe, not persistent)
watchlist_service = WatchlistService()

@api_view(['POST'])
def add_to_watchlist(request):
	symbol = request.data.get('symbol')
	if not symbol:
		return Response({'error': 'Symbol is required'}, status=status.HTTP_400_BAD_REQUEST)
	watchlist = watchlist_service.add(symbol)
	return Response({'watchlist': watchlist})

@api_view(['DELETE'])
def remove_from_watchlist(request):
	symbol = request.data.get('symbol')
	if not symbol:
		return Response({'error': 'Symbol is required'}, status=status.HTTP_400_BAD_REQUEST)
	watchlist = watchlist_service.remove(symbol)
	return Response({'watchlist': watchlist})

@api_view(['GET'])
def get_watchlist(request):
	return Response({'watchlist': watchlist_service.get()})

@api_view(['GET'])
def search_stocks_watchlist(request):
	query = request.GET.get('query', '')
	if not query:
		return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
	max_results = int(request.GET.get('max', 10))
	results = watchlist_service.search(query, max_results)
	return Response({'results': results})

@api_view(['GET'])
def get_sorted_watchlist(request):
	reverse = request.GET.get('reverse', 'false').lower() == 'true'
	sorted_list = watchlist_service.get_sorted(reverse)
	return Response({'watchlist': sorted_list})

class GetStocksInfo(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		try:
			max_val = int(request.GET.get('max', 10))
			offset = int(request.GET.get('offset', 0))
		except (TypeError, ValueError):
			return Response({'error': 'Invalid max or offset'}, status=400)
		stocks = get_stock_info(max_val, offset)

		return Response({'stocks': [s.to_dict() for s in stocks]})
class GetStockInfo(APIView):
	permission_classes = [AllowAny]

	def get(self, request, ticker):
		try:
			return Response(get_stock_by_ticker(ticker).to_dict(), status=200)
		except AttributeError:
			return Response({'error': 'Page Not Found'}, status=404)
class HelloWorldView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		return Response({"message": "Hello, world!"})
	
class GetStocks(APIView):
    permission_classes = [AllowAny]

    def get(self, request, ticker):
        stock = yf.Ticker(ticker)
        history = stock.history(period='1y')

        if history.empty:
            return Response("No data found for ticker", status=404)

        png_bytes = generate_stock_graph(history, ticker)
        return HttpResponse(png_bytes, content_type="image/png")
class WatchlistList(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		# For now, empty list
		watchlist = []
		return Response({"watchlist": watchlist})
