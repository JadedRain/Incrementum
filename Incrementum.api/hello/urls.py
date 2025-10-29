from django.urls import path
from .views_auth import login, signup, account_info
from .screener_views import (
    custom_screener_list_create, create_custom_screener, get_custom_screener, list_custom_screeners,
    update_custom_screener, delete_custom_screener
)
from .stocks_controller import (
    get_stocks_info, get_stock_graph, search_stocks_controller, stock_list_create, hello_world, get_stock_info_controller  
)
from .filter_views import (
    get_categorical_filter_types, get_numeric_filter_types
)
from .custom_collection_controller import (
    custom_collection, custom_collection_aggregate, custom_collection_aggregate_graph, custom_collection_overlay_graph
)
from .watchlist_controller import (
    get_watchlist,add_to_watchlist, remove_from_watchlist, search_stocks_watchlist, get_sorted_watchlist, add_custom_screener_to_watchlist,
    remove_custom_screener_from_watchlist, get_all_watchlist_screeners
)
from .filters_controller import (
    get_sectors, get_industries, get_industries2
)
from .screener_run_controller import run_screener

urlpatterns = [
    path('hello_world/', hello_world, name='hello_world'),
    path('getStocks/<str:ticker>/', get_stock_graph, name='get_stocks'),
    path('getStockInfo/', get_stocks_info, name='get_stock_info'),
    path('searchStocks/<str:query>/<int:page>/', search_stocks_controller, name='search_stocks'),
    path('stock/<str:ticker>/', get_stock_info_controller, name='get_stocks_by_ticker'),
    path('stocks/', stock_list_create, name='stock_list_create'),
    path('api/signup', signup, name='signup'),
    path('api/login', login, name='login'),
    path('api/account', account_info, name='account_info'),
    path('custom-collection/', custom_collection, name='custom_collection'),
    path('custom-collection/aggregate/', custom_collection_aggregate, name='custom_collection_aggregate'),
    path('custom-collection/aggregate-graph/', custom_collection_aggregate_graph, name='custom_collection_aggregate_graph'),
    path('custom-collection/overlay-graph/', custom_collection_overlay_graph, name='custom_collection_overlay_graph'),

    # Watchlist API endpoints
    path('watchlist/', get_watchlist, name='watchlist'),
    path('watchlist/add/', add_to_watchlist, name='add_to_watchlist'),
    path('watchlist/remove/', remove_from_watchlist, name='remove_from_watchlist'),
    path('watchlist/search/', search_stocks_watchlist, name='watchlist_search'),
    path('watchlist/sorted/', get_sorted_watchlist, name='watchlist_sorted'),

    # Watchlist Custom Screener API endpoints
    path('watchlist/custom-screeners/add/', add_custom_screener_to_watchlist, name='add_custom_screener_to_watchlist'),
    path('watchlist/custom-screeners/remove/', remove_custom_screener_from_watchlist, name='remove_custom_screener_from_watchlist'),
    path('watchlist/screeners/all/', get_all_watchlist_screeners, name='get_all_watchlist_screeners'),
    
    # Custom Screener API endpoints
    path('custom-screeners/', custom_screener_list_create, name='custom_screener_list_create'),
    path('screeners/custom/', create_custom_screener, name='create_custom_screener'),
    path('screeners/custom/list/', list_custom_screeners, name='list_custom_screeners'),
    path('screeners/custom/<screener_id>/', get_custom_screener, name='get_custom_screener'),
    path('screeners/custom/<int:screener_id>/update/', update_custom_screener, name='update_custom_screener'),
    path('screeners/custom/<int:screener_id>/delete/', delete_custom_screener, name='delete_custom_screener'),
    
    # Filter Options API endpoints
    path('filters/categorical/', get_categorical_filter_types, name='get_categorical_filter_types'),
    path('filters/numeric/', get_numeric_filter_types, name='get_numeric_filter_types'),
    path('sectors/', get_sectors, name='sectors'),
    path('industries/', get_industries, name='industries'),
    
    
    # Dynamic screener run endpoint
    path('stocks/getfilteredstocks', run_screener, name='get_filtered_stocks'),
    path('industries2/', get_industries2, name='industries2'),
]
