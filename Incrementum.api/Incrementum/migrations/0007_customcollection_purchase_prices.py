# Generated migration to add purchase_prices JSONField to CustomCollection
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0006_stockhistory_stockmodel_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='customcollection',
            name='purchase_prices',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
