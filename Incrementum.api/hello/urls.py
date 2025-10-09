from django.urls import path
from .views import (
    HelloWorldView, GetStocks, GetStocksInfo, SearchStocksView, GetStockInfo, StockListCreateView,
    SectorsView, IndustriesView,
    CustomCollectionView, CustomCollectionAggregateView, CustomCollectionOverlayGraphView
)
from .watchlist_controller import WatchlistController
from .views_auth import login, signup, account_info
from .screener_views import (
    custom_screener_list_create, create_custom_screener, get_custom_screener, list_custom_screeners,
    update_custom_screener, delete_custom_screener
)
from .filter_views import (
    get_categorical_filter_types, get_numeric_filter_types
)

watchlist_controller = WatchlistController()
urlpatterns = [
    path('hello_world/', HelloWorldView.as_view(), name='hello_world'),
    path('getStocks/<str:ticker>/', GetStocks.as_view(), name='get_stocks'),
    path('getStockInfo/', GetStocksInfo.as_view(), name='get_stock_info'),
    path('searchStocks/<str:query>/<int:page>/', SearchStocksView.as_view(), name='search_stocks'),
    path('stock/<str:ticker>/', GetStockInfo.as_view(), name='get_stocks_by_ticker'),
    path('stocks/', StockListCreateView.as_view(), name='stock_list_create'),
    path('api/signup', signup, name='signup'),
    path('api/login', login, name='login'),
    path('api/account', account_info, name='account_info'),
    path('custom-collection/', CustomCollectionView.as_view(), name='custom_collection'),
    path('custom-collection/aggregate/', CustomCollectionAggregateView.as_view(), name='custom_collection_aggregate'),
    path('custom-collection/aggregate-graph/', CustomCollectionAggregateView.as_view(), name='custom_collection_aggregate_graph'),
    path('custom-collection/overlay-graph/', CustomCollectionOverlayGraphView.as_view(), name='custom_collection_overlay_graph'),

    # Watchlist API endpoints
    path('watchlist/', watchlist_controller.get_watchlist, name='watchlist'),
    path('watchlist/add/', watchlist_controller.add_to_watchlist, name='add_to_watchlist'),
    path('watchlist/remove/', watchlist_controller.remove_from_watchlist, name='remove_from_watchlist'),
    path('watchlist/search/', watchlist_controller.search_stocks_watchlist, name='watchlist_search'),
    path('watchlist/sorted/', watchlist_controller.get_sorted_watchlist, name='watchlist_sorted'),

    # Watchlist Custom Screener API endpoints
    path('watchlist/custom-screeners/add/', WatchlistController.add_custom_screener_to_watchlist, name='add_custom_screener_to_watchlist'),
    path('watchlist/custom-screeners/remove/', WatchlistController.remove_custom_screener_from_watchlist, name='remove_custom_screener_from_watchlist'),
    path('watchlist/screeners/all/', WatchlistController.get_all_watchlist_screeners, name='get_all_watchlist_screeners'),
    
    # Custom Screener API endpoints
    path('custom-screeners/', custom_screener_list_create, name='custom_screener_list_create'),
    path('screeners/custom/', create_custom_screener, name='create_custom_screener'),
    path('screeners/custom/list/', list_custom_screeners, name='list_custom_screeners'),
    path('screeners/custom/<int:screener_id>/', get_custom_screener, name='get_custom_screener'),
    path('screeners/custom/<int:screener_id>/update/', update_custom_screener, name='update_custom_screener'),
    path('screeners/custom/<int:screener_id>/delete/', delete_custom_screener, name='delete_custom_screener'),
    
    # Filter Options API endpoints
    path('filters/categorical/', get_categorical_filter_types, name='get_categorical_filter_types'),
    path('filters/numeric/', get_numeric_filter_types, name='get_numeric_filter_types'),
    path('sectors/', SectorsView.as_view(), name='sectors'),
    path('industries/', IndustriesView.as_view(), name='industries'),
]
