from django.urls import path
from .views import HelloWorldView, getStocks

urlpatterns = [
    path('hello_world/', HelloWorldView.as_view(), name='hello_world'),
    path('getStocks/<str:ticker>/', getStocks.as_view(), name='get_stocks'),
]
