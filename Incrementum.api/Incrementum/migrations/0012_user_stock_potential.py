from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0011_add_yfinance_info_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserStockPotential',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('purchase_date', models.DateField()),
                ('quantity', models.DecimalField(decimal_places=4, max_digits=15)),
                ('purchase_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('account', models.ForeignKey(
                    db_column='account_id',
                    on_delete=django.db.models.deletion.CASCADE,
                    to='Incrementum.account'
                )),
                ('stock_symbol', models.ForeignKey(
                    db_column='stock_symbol',
                    on_delete=django.db.models.deletion.CASCADE,
                    to='Incrementum.stockmodel',
                    to_field='symbol'
                )),
            ],
            options={
                'db_table': 'user_stock_potential',
                'managed': True,
            },
        ),
    ]
