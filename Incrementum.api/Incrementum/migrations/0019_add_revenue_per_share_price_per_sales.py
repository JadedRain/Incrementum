from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0018_add_db_backed_stock_metrics_and_ratios'),
    ]

    operations = [
        migrations.AddField(
            model_name='stockmodel',
            name='revenue_per_share',
            field=models.DecimalField(
                blank=True,
                db_column='revenue_per_share',
                decimal_places=2,
                max_digits=20,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='price_per_sales',
            field=models.DecimalField(
                blank=True,
                db_column='price_per_sales',
                decimal_places=2,
                max_digits=20,
                null=True,
            ),
        ),
    ]
