from django.db import migrations, models


def forward_populate_visibility(apps, schema_editor):
    CustomScreener = apps.get_model('Incrementum', 'CustomScreener')
    CustomScreener.objects.filter(is_private=True).update(visibility='private')
    CustomScreener.objects.filter(is_private=False).update(visibility='public')


def backward_populate_is_private(apps, schema_editor):
    CustomScreener = apps.get_model('Incrementum', 'CustomScreener')
    CustomScreener.objects.filter(visibility='private').update(is_private=True)
    CustomScreener.objects.exclude(visibility='private').update(is_private=False)


class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0021_userstockpotential_screener'),
    ]

    operations = [
        migrations.AddField(
            model_name='customscreener',
            name='visibility',
            field=models.CharField(
                choices=[
                    ('private', 'Private'),
                    ('public', 'Public'),
                    ('community', 'Community'),
                ],
                default='private',
                max_length=20,
            ),
        ),
        migrations.RunPython(forward_populate_visibility, backward_populate_is_private),
    ]
