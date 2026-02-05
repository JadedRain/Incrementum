# Migration to remove foreign key constraint on stock_symbol

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0015_remove_stockmodel_foreign_keys'),
    ]

    operations = [
        # Remove foreign key constraint if it exists
        migrations.AlterField(
            model_name='customcollectionstock',
            name='stock_symbol',
            field=models.CharField(max_length=10, db_column='stock_symbol'),
        ),
        # Add database constraint removal via raw SQL if needed
        migrations.RunSQL(
            sql="""
            ALTER TABLE custom_collection_stock 
            DROP CONSTRAINT IF EXISTS custom_collection_stock_stock_symbol_7dc77a20_fk;
            """,
            reverse_sql="""
            -- No reverse needed
            """
        ),
    ]
