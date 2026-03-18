# Generated migration to remove duplicate api_key entries
from django.db import migrations
from django.db.models import Count

def remove_duplicate_api_keys(apps, schema_editor):
    """
    Remove duplicate api_key entries, keeping only the one with the lowest ID for each api_key.
    This handles the case where multiple Account records have the same api_key value.
    """
    Account = apps.get_model('Incrementum', 'Account')
    
    # Get all api_keys that have duplicates
    for account in Account.objects.values('api_key').annotate(
        count=Count('id')
    ).filter(count__gt=1):
        api_key = account['api_key']
        # Get all accounts with this api_key, ordered by id (keep lowest id)
        accounts = list(Account.objects.filter(api_key=api_key).order_by('id'))
        # Keep the first one, delete the rest
        accounts_to_delete = accounts[1:]
        for account_to_delete in accounts_to_delete:
            account_to_delete.delete()

def reverse_duplicate_api_keys(apps, schema_editor):
    """
    This migration is not reversible since we're deleting data.
    """
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('Incrementum', '0017_add_debt_to_equity_field'),
    ]

    operations = [
        migrations.RunPython(remove_duplicate_api_keys, reverse_duplicate_api_keys),
    ]
