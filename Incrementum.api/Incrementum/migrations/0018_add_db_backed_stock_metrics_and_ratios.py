from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0017_add_debt_to_equity_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stockmodel',
            name='day_percent_change',
            field=models.DecimalField(
                blank=True,
                db_column='percent_change',
                decimal_places=6,
                max_digits=12,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='price',
            field=models.IntegerField(
                blank=True,
                db_column='price',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='high52',
            field=models.IntegerField(
                blank=True,
                db_column='high52',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='low52',
            field=models.IntegerField(
                blank=True,
                db_column='low52',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='annual_eps_growth_rate',
            field=models.IntegerField(
                blank=True,
                db_column='annual_eps_growth_rate',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='price_per_earnings',
            field=models.IntegerField(
                blank=True,
                db_column='price_per_earnings',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='pe_per_growth',
            field=models.IntegerField(
                blank=True,
                db_column='pe_per_growth',
                null=True,
            ),
        ),
    ]
