from django.db import models


class Account(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=15, unique=True)
    email = models.CharField(max_length=50, unique=True)
    password_hash = models.CharField(max_length=255)
    api_key = models.CharField(max_length=64, unique=True)
    keycloak_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    class Meta:
        db_table = 'account'
        managed = True

    @classmethod
    def fetch_all(cls):
        """
        Fetch all accounts from the database.

        Returns:
            QuerySet: All Account objects from the database.
        """
        return cls.objects.all()
