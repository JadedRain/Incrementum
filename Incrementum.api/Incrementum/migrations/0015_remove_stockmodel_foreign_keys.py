# Generated migration to replace ForeignKey relationships with CharField

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0014_add_eps_field'),
    ]

    operations = [
        # Remove ManyToManyField from CustomCollection
        migrations.RemoveField(
            model_name='customcollection',
            name='stocks',
        ),
        
        # Change CustomCollectionStock.stock from ForeignKey to CharField
        migrations.RemoveField(
            model_name='customcollectionstock',
            name='stock',
        ),
        migrations.AddField(
            model_name='customcollectionstock',
            name='stock_symbol',
            field=models.CharField(db_column='stock_symbol', default='', max_length=10),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='customcollectionstock',
            name='collection',
            field=models.ForeignKey(
                db_column='collection_id',
                on_delete=django.db.models.deletion.CASCADE,
                to='Incrementum.customcollection'
            ),
        ),
        migrations.AlterUniqueTogether(
            name='customcollectionstock',
            unique_together={('collection', 'stock_symbol')},
        ),
        
        # Change UserStockPotential.stock_symbol from ForeignKey to CharField
        migrations.RemoveField(
            model_name='userstockpotential',
            name='stock_symbol',
        ),
        migrations.AddField(
            model_name='userstockpotential',
            name='stock_symbol',
            field=models.CharField(db_column='stock_symbol', default='', max_length=10),
            preserve_default=False,
        ),
        
        # Add stock_symbol to Blacklist (was missing from migration 0009)
        migrations.AddField(
            model_name='blacklist',
            name='stock_symbol',
            field=models.CharField(db_column='stock_symbol', default='', max_length=10),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='blacklist',
            unique_together={('stock_symbol', 'timestamp')},
        ),
    ]
