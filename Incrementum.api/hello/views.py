import io
import logging
from pathlib import Path

import matplotlib.pyplot as plt
import yfinance as yf

from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import logging
import json as _json
from .models import Stock
from .serializers import StockSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .get_stock_info import get_stock_info, search_stocks
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .get_stock_info import get_stock_info, search_stocks, get_stock_by_ticker, generate_stock_graph
from .models import Stock
from .serializers import StockSerializer
from .utils import get_unique_sectors, get_unique_industries

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
    	level=logging.INFO,
    	format="%(asctime)s - %(levelname)s - %(message)s")

	def get(self, request, query, page):
		results = search_stocks(query, page)
		logging.info(f"results: {results}")
		return Response(results)

class GetStocksInfo(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		try:
			max_val = int(request.GET.get('max', 10))
			offset = int(request.GET.get('offset', 0))
		except (TypeError, ValueError):
			return Response({'error': 'Invalid max or offset'}, status=400)

		filters = None
		filters_param = request.GET.get('filters')
		if filters_param:
			try:
				filters = _json.loads(filters_param)
			except Exception as e:
				return Response({'error': 'Invalid filters JSON', 'details': str(e)}, status=400)

		try:
			stocks = get_stock_info(max_val, offset, filters=filters)
		except Exception as e:
			return Response({'error': str(e)}, status=500)

		return Response({'stocks': [s.to_dict() for s in stocks]})
	
class GetStockInfo(APIView):
	permission_classes = [AllowAny]

	def get(self, request, ticker):
		try:
			return Response(get_stock_by_ticker(ticker).to_dict(), status=200)
		except AttributeError:
			return Response({'error': 'Page Not Found'}, status=404)
		
class GetStocks(APIView):
    permission_classes = [AllowAny]

    def get(self, request, ticker):
        period = request.query_params.get("period", "1y")
        interval = request.query_params.get("interval", "1d")

        stock = yf.Ticker(ticker)

        try:
            history = stock.history(period=period, interval=interval)
        except Exception as e:
            return Response(
                {"error": f"Invalid period '{period}' or interval '{interval}'"},
                status=400,
            )

        if history.empty:
            return Response(
                {"error": f"No data found for {ticker} with period={period} and interval={interval}"},
                status=404,
            )

        png_bytes = generate_stock_graph(history, ticker, f"{period}, {interval}")
        return HttpResponse(png_bytes, content_type="image/png")


class HelloWorldView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		return Response({"message": "Hello, world!"})
	