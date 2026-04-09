from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0019_add_revenue_per_share_price_per_sales'),
    ]

    operations = [
        migrations.AddField(
            model_name='customscreener',
            name='is_private',
            field=models.BooleanField(default=True),
        ),
    ]
