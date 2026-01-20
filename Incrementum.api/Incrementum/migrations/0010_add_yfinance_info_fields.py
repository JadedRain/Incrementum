import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0009_blacklist_alter_stockmodel_updated_at'),
    ]

    operations = [
        # Create Blacklist model
        migrations.CreateModel(
            name='Blacklist',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField()),
                ('time_added', models.DateTimeField()),
            ],
            options={
                'db_table': 'blacklist',
                'managed': False,
            },
        ),

        # Add Polygon API fields
        migrations.AddField(
            model_name='stockmodel',
            name='cik',
            field=models.CharField(blank=True, db_column='cik', max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='composite_figi',
            field=models.CharField(
                blank=True, db_column='composite_figi',
                max_length=50, null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='currency_name',
            field=models.CharField(
                blank=True, db_column='currency_name',
                max_length=50, null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='description',
            field=models.TextField(blank=True, db_column='description', null=True),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='homepage_url',
            field=models.CharField(
                blank=True, db_column='homepage_url',
                max_length=500, null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='list_date',
            field=models.DateField(blank=True, db_column='list_date', null=True),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='locale',
            field=models.CharField(blank=True, db_column='locale', max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='market_cap',
            field=models.BigIntegerField(
                blank=True, db_column='market_cap', null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='outstanding_shares',
            field=models.BigIntegerField(
                blank=True, db_column='outstanding_shares', null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='primary_exchange',
            field=models.CharField(
                blank=True, db_column='primary_exchange',
                max_length=50, null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='share_class_figi',
            field=models.CharField(
                blank=True, db_column='share_class_figi',
                max_length=50, null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='sic_code',
            field=models.CharField(blank=True, db_column='sic_code', max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='sic_description',
            field=models.CharField(
                blank=True, db_column='sic_description',
                max_length=255, null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='total_employees',
            field=models.IntegerField(
                blank=True, db_column='total_employees', null=True
            ),
        ),
        migrations.AddField(
            model_name='stockmodel',
            name='type',
            field=models.CharField(blank=True, db_column='type', max_length=50, null=True),
        ),

        # Alter existing fields
        migrations.AlterField(
            model_name='stockmodel',
            name='company_name',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='stockmodel',
            name='updated_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
