from django.urls import path
from .views import HelloWorldView, get_sorted_watchlist, getStocks, remove_from_watchlist, search_stocks_watchlist
from .views import GetStocksInfo
from .views import SearchStocksView
from .views import add_to_watchlist, get_watchlist, GetStockInfo

urlpatterns = [
    path('hello_world/', HelloWorldView.as_view(), name='hello_world'),
    path('getStocks/<str:ticker>/', getStocks.as_view(), name='get_stocks'),
    path('getStockInfo/', GetStocksInfo.as_view(), name='get_stock_info'),
    path('searchStocks/<str:query>/', SearchStocksView.as_view(), name='search_stocks'),
    path('watchlist/add/', add_to_watchlist, name='add_to_watchlist'),
    path('watchlist/', get_watchlist, name='get_watchlist'),
    path('watchlist/remove/', remove_from_watchlist, name='remove_from_watchlist'),
    path('watchlist/search/', search_stocks_watchlist, name='search_stocks_watchlist'),
    path('watchlist/sorted/', get_sorted_watchlist, name='get_sorted_watchlist'),  # New endpoint for getting sorted watchlist
    path('stock/<str:ticker>/', GetStockInfo.as_view(), name='get_stocks_by_ticker'),
]
