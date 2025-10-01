from django.urls import path
from .views import (
    HelloWorldView, GetStocks, GetStocksInfo, SearchStocksView, GetStockInfo, StockListCreateView,
    WatchlistView, WatchlistSearchView, WatchlistSortedView,
    SectorsView, IndustriesView,
    CustomCollectionView, CustomCollectionAggregateView, CustomCollectionAggregateGraphView, CustomCollectionOverlayGraphView
)
from .views_auth import login, signup, account_info
from .screener_views import (
    create_custom_screener, get_custom_screener, list_custom_screeners,
    update_custom_screener, delete_custom_screener
)
from .watchlist_screener_views import (
    add_custom_screener_to_watchlist, remove_custom_screener_from_watchlist,
    get_all_watchlist_screeners
)
from .filter_views import (
    get_categorical_filter_types, get_numeric_filter_types,
    get_categorical_filter_values, get_all_filter_options
)

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
    path('custom-collection/aggregate-graph/', CustomCollectionAggregateView.as_view(), name='custom_collection_aggregate_graph'),
    path('custom-collection/overlay-graph/', CustomCollectionOverlayGraphView.as_view(), name='custom_collection_overlay_graph'),
    
    # Custom Screener API endpoints
    path('screeners/custom/', create_custom_screener, name='create_custom_screener'),
    path('screeners/custom/list/', list_custom_screeners, name='list_custom_screeners'),
    path('screeners/custom/<int:screener_id>/', get_custom_screener, name='get_custom_screener'),
    path('screeners/custom/<int:screener_id>/update/', update_custom_screener, name='update_custom_screener'),
    path('screeners/custom/<int:screener_id>/delete/', delete_custom_screener, name='delete_custom_screener'),
    
    # Watchlist Custom Screener API endpoints
    path('watchlist/custom-screeners/add/', add_custom_screener_to_watchlist, name='add_custom_screener_to_watchlist'),
    path('watchlist/custom-screeners/remove/', remove_custom_screener_from_watchlist, name='remove_custom_screener_from_watchlist'),
    path('watchlist/screeners/all/', get_all_watchlist_screeners, name='get_all_watchlist_screeners'),
    
    # Filter Options API endpoints
    path('filters/categorical/', get_categorical_filter_types, name='get_categorical_filter_types'),
    path('filters/numeric/', get_numeric_filter_types, name='get_numeric_filter_types'),
    path('filters/categorical/<str:filter_name>/values/', get_categorical_filter_values, name='get_categorical_filter_values'),
    path('filters/all/', get_all_filter_options, name='get_all_filter_options'),
]
