from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0015_remove_purchase_prices_from_customcollection'),
    ]

    operations = [
        migrations.AddField(
            model_name='stockmodel',
            name='day_percent_change',
            field=models.DecimalField(
                blank=True,
                db_column='day_percent_change',
                decimal_places=6,
                max_digits=12,
                null=True,
            ),
        ),
    ]
