from rest_framework import status
from rest_framework.decorators import api_view
from .watchlist_service import WatchlistService
from .get_stock_info import get_stock_info
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import yfinance as yf


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
class GetStockInfo(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		try:
			max_val = int(request.GET.get('max', 10))
			offset = int(request.GET.get('offset', 0))
		except (TypeError, ValueError):
			return Response({'error': 'Invalid max or offset'}, status=400)
		stocks = get_stock_info(max_val, offset)

		return Response({'stocks': [s.to_dict() for s in stocks]})
	
class HelloWorldView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		return Response({"message": "Hello, world!"})
	
class getStocks(APIView):
	permission_classes = [AllowAny]

	def get(self, request, ticker):
		stock = yf.Ticker(ticker)
		return Response({"stocks": stock.history(period = '1y')})
