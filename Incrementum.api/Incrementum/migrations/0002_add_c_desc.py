from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customcollection',
            name='c_desc',
            field=models.CharField(max_length=300, null=True, blank=True),
        ),
    ]
