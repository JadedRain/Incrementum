from django.urls import path
from .filters_controller import FiltersController
from .custom_collection_controller import CustomCollectionController
from .stocks_controller import StocksController
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
    path('hello_world/', StocksController.hello_world, name='hello_world'),
    path('getStocks/<str:ticker>/', StocksController.get_stock_graph, name='get_stocks'),
    path('getStockInfo/', StocksController.get_stocks_info, name='get_stock_info'),
    path('searchStocks/<str:query>/<int:page>/', StocksController.search_stocks, name='search_stocks'),
    path('stock/<str:ticker>/', StocksController.get_stock_info, name='get_stocks_by_ticker'),
    path('stocks/', StocksController.stock_list_create, name='stock_list_create'),
    path('api/signup', signup, name='signup'),
    path('api/login', login, name='login'),
    path('api/account', account_info, name='account_info'),
    path('custom-collection/', CustomCollectionController.custom_collection, name='custom_collection'),
    path('custom-collection/aggregate/', CustomCollectionController.custom_collection_aggregate, name='custom_collection_aggregate'),
    path('custom-collection/aggregate-graph/', CustomCollectionController.custom_collection_aggregate_graph, name='custom_collection_aggregate_graph'),
    path('custom-collection/overlay-graph/', CustomCollectionController.custom_collection_overlay_graph, name='custom_collection_overlay_graph'),

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
    path('sectors/', FiltersController.get_sectors, name='sectors'),
    path('industries/', FiltersController.get_industries, name='industries'),
]
