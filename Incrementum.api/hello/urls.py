from django.urls import path
from .views import HelloWorldView, getStocks
from .views import GetStockInfo

urlpatterns = [
    path('hello_world/', HelloWorldView.as_view(), name='hello_world'),
    path('getStocks/<str:ticker>/', getStocks.as_view(), name='get_stocks'),
    path('getStockInfo/', GetStockInfo.as_view(), name='get_stock_info'),
]
