from django.urls import path
from .views import HelloWorldView

urlpatterns = [
    path('hello_world/', HelloWorldView.as_view(), name='hello_world'),
]
