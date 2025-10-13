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

from .custom_collection_service import CustomCollectionService
from .get_stock_info import get_stock_info, search_stocks, get_stock_by_ticker, generate_stock_graph
from .graph_utils import generate_overlay_graph
from .models import Stock
from .serializers import StockSerializer
from .utils import get_unique_sectors, get_unique_industries
from .watchlist_service import WatchlistService

custom_collection = CustomCollectionService()
watchlist_service = WatchlistService()


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

class WatchlistView(APIView):
	permission_classes = [AllowAny]
	
	def get(self, request):
		user_id = request.headers.get('X-User-Id')
		if not user_id:
			return Response({'error': 'user_id is required in headers'}, status=status.HTTP_400_BAD_REQUEST)
		wl = watchlist_service.get(user_id)
		logging.info(f"[watchlist:get] user_id={user_id} size={len(wl)}")
		return Response({'watchlist': wl})
	
	def post(self, request):
		symbol = request.data.get('symbol')
		user_id = request.headers.get('X-User-Id')
		if not symbol or not user_id:
			return Response({'error': 'Symbol and user_id are required'}, status=status.HTTP_400_BAD_REQUEST)
		logging.info(f"[watchlist:add] user_id={user_id} symbol={symbol}")
		watchlist = watchlist_service.add(user_id, symbol)
		logging.info(f"[watchlist:add] size={len(watchlist)}")
		return Response({'watchlist': watchlist})
	
	def delete(self, request):
		symbol = request.data.get('symbol')
		user_id = request.headers.get('X-User-Id')
		if not symbol or not user_id:
			return Response({'error': 'Symbol and user_id are required'}, status=status.HTTP_400_BAD_REQUEST)
		logging.info(f"[watchlist:remove] user_id={user_id} symbol={symbol}")
		watchlist = watchlist_service.remove(user_id, symbol)
		logging.info(f"[watchlist:remove] size={len(watchlist)}")
		return Response({'watchlist': watchlist})

@csrf_exempt
@api_view(['POST'])
def add_to_watchlist(request):
	symbol = request.data.get('symbol')
	user_id = request.headers.get('X-User-Id')
	if not symbol or not user_id:
		return Response({'error': 'Symbol and user_id are required'}, status=status.HTTP_400_BAD_REQUEST)
	logging.info(f"[watchlist:add] user_id={user_id} symbol={symbol}")
	watchlist = watchlist_service.add(user_id, symbol)
	logging.info(f"[watchlist:add] size={len(watchlist)}")
	return Response({'watchlist': watchlist})

@csrf_exempt
@api_view(['DELETE'])
def remove_from_watchlist(request):
	symbol = request.data.get('symbol')
	user_id = request.headers.get('X-User-Id')
	if not symbol or not user_id:
		return Response({'error': 'Symbol and user_id are required'}, status=status.HTTP_400_BAD_REQUEST)
	logging.info(f"[watchlist:remove] user_id={user_id} symbol={symbol}")
	watchlist = watchlist_service.remove(user_id, symbol)
	logging.info(f"[watchlist:remove] size={len(watchlist)}")
	return Response({'watchlist': watchlist})

@api_view(['GET'])
def get_watchlist(request):
	user_id = request.headers.get('X-User-Id')
	if not user_id:
		return Response({'error': 'user_id is required in headers'}, status=status.HTTP_400_BAD_REQUEST)
	wl = watchlist_service.get(user_id)
	logging.info(f"[watchlist:get] user_id={user_id} size={len(wl)}")
	return Response({'watchlist': wl})

@api_view(['GET'])
def search_stocks_watchlist(request):
	query = request.GET.get('query', '')
	user_id = request.headers.get('X-User-Id')
	if not query or not user_id:
		return Response({'error': 'Query and user_id are required'}, status=status.HTTP_400_BAD_REQUEST)
	max_results = int(request.GET.get('max', 10))
	results = watchlist_service.search(user_id, query, max_results)
	return Response({'results': results})

@api_view(['GET'])
def get_sorted_watchlist(request):
	user_id = request.headers.get('X-User-Id')
	if not user_id:
		return Response({'error': 'user_id is required in headers'}, status=status.HTTP_400_BAD_REQUEST)
	sorted_wl = watchlist_service.get(user_id)
	logging.info(f"[watchlist:get_sorted] user_id={user_id} size={len(sorted_wl)}")
	return Response({'watchlist': sorted_wl})

class WatchlistSearchView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		query = request.GET.get('query', '')
		if not query:
			return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
		max_results = int(request.GET.get('max', 10))
		results = watchlist_service.search(query, max_results)
		return Response({'results': results})


class WatchlistSortedView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		sorted_wl = watchlist_service.get_sorted()
		logging.info(f"[watchlist:get_sorted] size={len(sorted_wl)}")
		return Response({'watchlist': sorted_wl})

class SectorsView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		csv_path = Path(__file__).resolve().parent / 'data' / 'ticker_info.csv'
		try:
			sectors = get_unique_sectors(csv_path)
		except Exception as e:
			return Response({'error': str(e)}, status=500)
		return Response({'sectors': sectors})


@api_view(['GET'])
def get_industries(request):
    csv_path = Path(__file__).resolve().parent / 'data' / 'ticker_info.csv'
    try:
        industries = get_unique_industries(csv_path)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    return Response({'industries': industries})

class IndustriesView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		csv_path = Path(__file__).resolve().parent / 'data' / 'ticker_info.csv'
		try:
			industries = get_unique_industries(csv_path)
		except Exception as e:
			return Response({'error': str(e)}, status=500)
		return Response({'industries': industries})

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
		
class HelloWorldView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		return Response({"message": "Hello, world!"})
	
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

class WatchlistList(APIView):
	permission_classes = [AllowAny]
 
	def get(self, request):
		watchlist = self.watchlist_service.get()
		return Response({"watchlist": watchlist})
	def post(self, request):
		symbol = request.data.get('symbol')
		if not symbol:
			return Response({'error': 'Symbol is required'}, status=status.HTTP_400_BAD_REQUEST)
		logging.info(f"[watchlist:add] symbol={symbol}")
		watchlist = self.watchlist_service.add(symbol)
		logging.info(f"[watchlist:add] size={len(watchlist)}")
		return Response({'watchlist': watchlist})

class CustomCollectionView(APIView):
	def get(self, request):
		return Response({'tokens': custom_collection.get_stocks()})

	def post(self, request):
		token = request.data.get('token')
		if not token:
			return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
		custom_collection.add_stock(token)
		return Response({'tokens': custom_collection.get_stocks()})

	def delete(self, request):
		token = request.data.get('token')
		if not token:
			return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
		custom_collection.remove_stock(token)
		return Response({'tokens': custom_collection.get_stocks()})

class CustomCollectionAggregateView(APIView):
	def get(self, request):
		data = custom_collection.aggregate_data()
		return Response(data)

class CustomCollectionAggregateGraphView(APIView):
	def get(self, request):
		tokens = custom_collection.get_stocks()
		logger = logging.getLogger("django")
		try:
			if not tokens:
				logger.error("No stocks in collection")
				return HttpResponse("No stocks in collection", status=404)
			ticker = tokens[0]
			stock = yf.Ticker(ticker)
			history = stock.history(period="1y")
			if history is None or history.empty:
				logger.error(f"No history for ticker {ticker}")
				return HttpResponse(f"No history for ticker {ticker}", status=500)
			img_bytes = generate_stock_graph(history, ticker, "1y")
			return HttpResponse(img_bytes, content_type="image/png")
		except Exception as e:
			logger.exception("Error generating aggregate graph")
			return HttpResponse(f"Error generating graph: {str(e)}", status=500)

class CustomCollectionOverlayGraphView(APIView):
	def get(self, request):
		tokens = custom_collection.get_stocks()
		img_bytes, error = generate_overlay_graph(tokens)
		if error:
			return HttpResponse(error, status=500)
		return HttpResponse(img_bytes, content_type="image/png")