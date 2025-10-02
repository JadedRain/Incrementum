from django.urls import path
from .views import (
    HelloWorldView, GetStocks, GetStocksInfo, SearchStocksView, GetStockInfo, StockListCreateView,
    WatchlistView, WatchlistSearchView, WatchlistSortedView,
    SectorsView, IndustriesView,
    CustomCollectionView, CustomCollectionAggregateView, CustomCollectionAggregateGraphView, CustomCollectionOverlayGraphView
)
from .views_auth import login, signup, account_info

urlpatterns = [
    path('hello_world/', HelloWorldView.as_view(), name='hello_world'),
    path('getStocks/<str:ticker>/', GetStocks.as_view(), name='get_stocks'),
    path('getStockInfo/', GetStocksInfo.as_view(), name='get_stock_info'),
    path('searchStocks/<str:query>/<int:page>/', SearchStocksView.as_view(), name='search_stocks'),
    path('watchlist/', WatchlistView.as_view(), name='watchlist'),
    path('watchlist/search/', WatchlistSearchView.as_view(), name='watchlist_search'),
    path('watchlist/sorted/', WatchlistSortedView.as_view(), name='watchlist_sorted'),
    path('stock/<str:ticker>/', GetStockInfo.as_view(), name='get_stocks_by_ticker'),
    path('stocks/', StockListCreateView.as_view(), name='stock_list_create'),
    path('api/signup', signup, name='signup'),
    path('api/login', login, name='login'),
    path('api/account', account_info, name='account_info'),
    path('sectors/', SectorsView.as_view(), name='sectors'),
    path('industries/', IndustriesView.as_view(), name='industries'),
    path('custom-collection/', CustomCollectionView.as_view(), name='custom_collection'),
    path('custom-collection/aggregate/', CustomCollectionAggregateView.as_view(), name='custom_collection_aggregate'),
    path('custom-collection/aggregate-graph/', CustomCollectionAggregateGraphView.as_view(), name='custom_collection_aggregate_graph'),
    path('custom-collection/overlay-graph/', CustomCollectionOverlayGraphView.as_view(), name='custom_collection_overlay_graph'),
]
