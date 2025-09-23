from .models import Stock
from .serializers import StockSerializer
# API endpoint to insert and get Stock objects from the database
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
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
from django.views.decorators.csrf import csrf_exempt
# Configure logging


class StockListCreateView(APIView):
	def get(self, request):
		stocks = Stock.objects.all()
		serializer = StockSerializer(stocks, many=True)
		return Response(serializer.data)

	def post(self, request):
		serializer = StockSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	
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

@csrf_exempt
@api_view(['POST'])
def add_to_watchlist(request):
	symbol = request.data.get('symbol')
	if not symbol:
		return Response({'error': 'Symbol is required'}, status=status.HTTP_400_BAD_REQUEST)
	logging.info(f"[watchlist:add] symbol={symbol}")
	watchlist = watchlist_service.add(symbol)
	logging.info(f"[watchlist:add] size={len(watchlist)}")
	return Response({'watchlist': watchlist})

@csrf_exempt
@api_view(['DELETE'])
def remove_from_watchlist(request):
	symbol = request.data.get('symbol')
	if not symbol:
		return Response({'error': 'Symbol is required'}, status=status.HTTP_400_BAD_REQUEST)
	logging.info(f"[watchlist:remove] symbol={symbol}")
	watchlist = watchlist_service.remove(symbol)
	logging.info(f"[watchlist:remove] size={len(watchlist)}")
	return Response({'watchlist': watchlist})

@api_view(['GET'])
def get_watchlist(request):
	wl = watchlist_service.get()
	logging.info(f"[watchlist:get] size={len(wl)}")
	return Response({'watchlist': wl})

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
