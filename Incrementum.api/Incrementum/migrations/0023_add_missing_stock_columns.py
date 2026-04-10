from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0022_customscreener_visibility'),
    ]

    operations = [
        migrations.AddField(
            model_name='stockmodel',
            name='last_candle',
            field=models.CharField(
                blank=True,
                db_column='last_candle',
                max_length=20,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='total_revenue',
            field=models.BigIntegerField(
                blank=True,
                db_column='total_revenue',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='high52_updated_at',
            field=models.DateTimeField(
                blank=True,
                db_column='high52_updated_at',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='low52_updated_at',
            field=models.DateTimeField(
                blank=True,
                db_column='low52_updated_at',
                null=True,
            ),
        ),
    ]
