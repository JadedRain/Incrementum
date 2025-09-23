from django.db import models
import uuid
from django.contrib.auth.hashers import make_password, check_password

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=128)
    api_key = models.CharField(max_length=64, unique=True, default=uuid.uuid4)

    @classmethod
    def create_user(cls, username, password):
        password_hash = make_password(password)
        api_key = str(uuid.uuid4())
        return cls.objects.create(username=username, password_hash=password_hash, api_key=api_key)

    def check_password(self, password):
        return check_password(password, self.password_hash)
