from rest_framework import serializers
from .models.stock import StockModel


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockModel
        fields = ['id', 'symbol', 'company_name']
