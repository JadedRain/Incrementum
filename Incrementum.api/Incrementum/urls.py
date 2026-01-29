from django.urls import path
from .views_auth import (
    login, signup, account_info, sync_keycloak_user, keycloak_login
)
from . import views, screener_views, filter_views, views_user_stock_potential
from .controllers import stocks_controller as stocks
from .controllers import custom_collection_controller as collections
from .controllers.screener_run_controller import run_screener

urlpatterns = [
    # Authentication endpoints
    path('api/signup',
         signup,
         name='signup'),
    path('api/login',
         login,
         name='login'),
    path('api/account',
         account_info,
         name='account_info'),
    path('api/keycloak-login',
         keycloak_login,
         name='keycloak_login'),
    path('api/sync-keycloak-user',
         sync_keycloak_user,
         name='sync_keycloak_user'),

    # Stock endpoints
    path('stock/<str:ticker>/',
         stocks.get_stock_info_controller,
         name='get_stock_info'),
    path('stock/<str:ticker>/metadata/',
         stocks.get_stock_metadata,
         name='get_stock_metadata'),
    path('stock/<str:ticker>/eps/',
         stocks.get_stock_eps,
         name='get_stock_eps'),
    path('stocks/',
         stocks.stock_list_create,
         name='stock_list_create'),
    path('stocks/database/',
         stocks.get_database_stocks,
         name='get_database_stocks'),
    path('stocks/search/<str:query>/<int:page>/',
         stocks.search_stocks_controller,
         name='search_stocks'),
    path('stocks/industry-autocomplete/',
         screener_views.industry_autocomplete,
         name='industry_autocomplete'),
    path('stocks/bulk/',
         stocks.get_stocks_by_tickers,
         name='get_stocks_by_tickers'),

    # Custom collection endpoints
    path('custom-collection/',
         collections.custom_collection,
         name='custom_collection'),
    path('custom-collection/<int:collection_id>/',
         collections.custom_collection_by_id,
         name='custom_collection_by_id'),
    path('custom-collection/aggregate/',
         collections.custom_collection_aggregate,
         name='custom_collection_aggregate'),
    path('custom-collection/aggregate-graph/',
         collections.custom_collection_aggregate_graph,
         name='custom_collection_aggregate_graph'),
    path('custom-collection/overlay-graph/',
         collections.custom_collection_overlay_graph,
         name='custom_collection_overlay_graph'),
    path('custom-collections/',
         collections.custom_collections_list,
         name='custom_collections_list'),

    # Screener endpoints
    path('screeners/custom/',
         screener_views.create_custom_screener,
         name='create_custom_screener'),
    path('screeners/custom/list/',
         screener_views.list_custom_screeners,
         name='list_custom_screeners'),
    path('screeners/custom/<int:screener_id>/',
         screener_views.get_custom_screener,
         name='get_custom_screener'),
    path('screeners/custom/<int:screener_id>/update/',
         screener_views.update_custom_screener,
         name='update_custom_screener'),
    path('screeners/custom/<int:screener_id>/delete/',
         screener_views.delete_custom_screener,
         name='delete_custom_screener'),
    path('screeners/run/',
         run_screener,
         name='run_screener'),
    path('screeners/database/',
         screener_views.run_database_screener,
         name='run_database_screener'),

    # Filter endpoints
    path('filters/categorical/',
         filter_views.get_categorical_filter_types,
         name='get_categorical_filter_types'),
    path('filters/numeric/',
         filter_views.get_numeric_filter_types,
         name='get_numeric_filter_types'),

    # Data endpoints
    path('fear-greed/csv/',
         views.get_fear_greed_from_csv,
         name='fear_greed_csv'),
    path('fetch-polygon-stocks/',
         views.fetch_polygon_stocks_view,
         name='fetch_polygon_stocks'),
    path('fetch-update-list-stocks/',
         views.fetch_update_and_list_stocks,
         name='fetch_update_list_stocks'),
    path('fetch-and-update-database/',
         views.fetch_and_update_database,
         name='fetch_and_update_database'),

    # DEPRECATED - Outdated filter endpoint
    # TODO: Remove once filter system migration is complete
    # Currently updating the way filters are processed
    path('stocks/getfilteredstocks',
         run_screener,
         name='get_filtered_stocks'),
    path('custom-screeners',
         screener_views.custom_screener_list_create,
         name='custom_screener_list_create'),

    # User stock potential endpoints
    path('api/user-stock-potentials/',
         views_user_stock_potential.user_stock_potential_list_create,
         name='user_stock_potential_list_create'),
    
    path('stock/<str:ticker>/percent-change/',
          stocks.get_percent_change,
          name='get_percent_change'),
]
