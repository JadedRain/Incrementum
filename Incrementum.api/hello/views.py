from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import yfinance as yf

class HelloWorldView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		return Response({"message": "Hello, world!"})
	
class getStocks(APIView):
	permission_classes = [AllowAny]

	def get(self, request, ticker):
		stock = yf.Ticker(ticker)
		return Response({"stocks": stock.history(period = '1y')})
