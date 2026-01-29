from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Incrementum", "0013_alter_userstockpotential_stock_symbol"),
    ]

    operations = [
        migrations.AddField(
            model_name='stockmodel',
            name='eps',
            field=models.DecimalField(max_digits=20,
                                      decimal_places=4,
                                      null=True, blank=True,
                                      db_column='eps'),
        ),
    ]
