# Generated migration to remove purchase_prices field from CustomCollection

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0014_add_eps_field'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customcollection',
            name='purchase_prices',
        ),
    ]
