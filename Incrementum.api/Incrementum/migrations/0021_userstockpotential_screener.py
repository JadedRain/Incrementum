from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0020_customscreener_is_private'),
    ]

    operations = [
        migrations.AddField(
            model_name='userstockpotential',
            name='screener',
            field=models.ForeignKey(
                blank=True,
                db_column='screener',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='Incrementum.customscreener',
            ),
        ),
    ]
