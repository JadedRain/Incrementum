from rest_framework import serializers
from .models.stock import StockModel
from .models.user_stock_potential import UserStockPotential


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockModel
        fields = ['symbol', 'company_name']


class UserStockPotentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStockPotential
        fields = ['id', 'account', 'stock_symbol', 'purchase_date', 'quantity', 'purchase_price']
        read_only_fields = ['id']
