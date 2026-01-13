from django.db import models


class Screener(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)
    description = models.CharField(max_length=300, blank=True, null=True)

    class Meta:
        db_table = 'screener'

    def __str__(self):
        return self.name

    @classmethod
    def fetch_all(cls):
        """
        Fetch all screeners from the database.
        
        Returns:
            QuerySet: All Screener objects from the database.
        """
        return cls.objects.all()
