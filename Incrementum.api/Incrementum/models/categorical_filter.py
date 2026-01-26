from django.db import models


class CategoricalFilter(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)

    class Meta:
        db_table = 'categorical_filter'

    def __str__(self):
        return self.name

    @classmethod
    def fetch_all(cls):
        return cls.objects.all()
