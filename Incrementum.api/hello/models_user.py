from django.db import models

class Account(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=15, unique=True)
    email = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    api_key = models.CharField(max_length=64, unique=True)

    class Meta:
        db_table = 'account'
        managed = True
