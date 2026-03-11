from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0016_add_day_percent_change_cache_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='stockmodel',
            name='debt_to_equity',
            field=models.DecimalField(
                blank=True,
                db_column='debt_to_equity',
                decimal_places=4,
                max_digits=12,
                null=True,
            ),
        ),
    ]
