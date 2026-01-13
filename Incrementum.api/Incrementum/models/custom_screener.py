from django.db import models


class CustomScreener(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.ForeignKey(
        'account.Account',
        on_delete=models.CASCADE,
        db_column='account_id'
    )
    screener_name = models.CharField(max_length=100, default='Untitled Screener')
    created_at = models.DateTimeField(auto_now_add=True)
    filters = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'custom_screener'

    def __str__(self):
        return f"Custom Screener {self.id} by {self.account.name}"

    @classmethod
    def fetch_all(cls):
        """
        Fetch all custom screeners from the database.
        
        Returns:
            QuerySet: All CustomScreener objects from the database.
        """
        return cls.objects.all()
