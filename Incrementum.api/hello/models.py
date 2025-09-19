from django.db import models

class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    company_name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.symbol} - {self.company_name}"
