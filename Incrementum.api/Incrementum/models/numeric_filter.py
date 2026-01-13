from django.db import models


class NumericFilter(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)

    class Meta:
        db_table = 'numeric_filter'

    def __str__(self):
        return self.name

    @classmethod
    def fetch_all(cls):
        """
        Fetch all numeric filters from the database.

        Returns:
            QuerySet: All NumericFilter objects from the database.
        """
        return cls.objects.all()
