import logging
from .models import CustomScreener
from .models_user import Account
from django.db import transaction


class ScreenerService:
    def __init__(self):
        pass

    def create_custom_screener(self, user_id, name=None, numeric_filters=None, categorical_filters=None):
        try:
            account = Account.objects.get(api_key=user_id)
        except Account.DoesNotExist:
            logging.error(f"Account with api_key {user_id} does not exist.")
            return None

        final_name = name or 'Untitled Screener'
        logging.debug(f"Creating screener with name: {final_name}")

        with transaction.atomic():
            custom_screener = CustomScreener.objects.create(
                account=account,
                screener_name=final_name
            )

            filters_to_store = []
            if numeric_filters:
                for f in numeric_filters:
                    operand = f.get('filter_name') or f.get('operand')
                    value_low = f.get('value_low') if 'value_low' in f else None
                    value_high = f.get('value_high') if 'value_high' in f else None

                    raw_value = f.get('numeric_value') if 'numeric_value' in f else f.get('value')
                    if isinstance(raw_value, (list, tuple)):
                        if len(raw_value) >= 2:
                            value_low, value_high = raw_value[0], raw_value[1]
                        elif len(raw_value) == 1:
                            raw_value = raw_value[0]

                    if value_low is not None or value_high is not None:
                        value_to_store = None
                    else:
                        value_to_store = raw_value

                    filters_to_store.append({
                        'operator': f.get('operator', 'eq'),
                        'operand': operand,
                        'filter_type': 'numeric',
                        'value': value_to_store,
                        'value_low': value_low,
                        'value_high': value_high,
                    })

            if categorical_filters:
                for f in categorical_filters:
                    operand = f.get('filter_name') or f.get('operand')
                    value = f.get('category_value') if 'category_value' in f else f.get('value')
                    filters_to_store.append({
                        'operator': f.get('operator', 'eq'),
                        'operand': operand,
                        'filter_type': 'categorical',
                        'value': value,
                        'value_low': None,
                        'value_high': None,
                    })

            custom_screener.filters = filters_to_store
            custom_screener.save()

        return custom_screener

    def get_custom_screener(self, user_id, screener_id):
        if screener_id == "undefined":
            return {
                'id': "undefined",
                'created_at': "na",
                'numeric_filters': [],
                'categorical_filters': []
            }

        account = Account.objects.get(api_key=user_id)
        custom_screener = CustomScreener.objects.get(id=screener_id, account=account)

        numeric_filters = [f for f in (custom_screener.filters or []) if f.get('filter_type') == 'numeric']
        categorical_filters = [f for f in (custom_screener.filters or []) if f.get('filter_type') == 'categorical']

        return {
            'id': custom_screener.id,
            'created_at': custom_screener.created_at,
            'numeric_filters': numeric_filters,
            'categorical_filters': categorical_filters
        }

    def get_user_custom_screeners(self, user_id):
        try:
            account = Account.objects.get(api_key=user_id)
        except Account.DoesNotExist:
            logging.error(f"Account with api_key {user_id} does not exist.")
            return []

        screeners = []
        for custom_screener in CustomScreener.objects.filter(account=account):
            filters_list = custom_screener.filters or []
            screeners.append({
                'id': custom_screener.id,
                'screener_name': custom_screener.screener_name,
                'created_at': custom_screener.created_at.isoformat(),
                'filter_count': len(filters_list)
            })

        return screeners

    def delete_custom_screener(self, user_id, screener_id):
        account = Account.objects.get(api_key=user_id)
        custom_screener = CustomScreener.objects.get(id=screener_id, account=account)

        with transaction.atomic():
            custom_screener.delete()

        logging.info(f"Deleted custom screener {screener_id} for user {user_id}")
        return True

    def update_custom_screener(self, user_id, screener_id, numeric_filters=None, categorical_filters=None):
        account = Account.objects.get(api_key=user_id)
        custom_screener = CustomScreener.objects.get(id=screener_id, account=account)

        with transaction.atomic():
            filters_to_store = []
            if numeric_filters:
                for f in numeric_filters:
                    operand = f.get('filter_name') or f.get('operand')
                    value_low = f.get('value_low') if 'value_low' in f else None
                    value_high = f.get('value_high') if 'value_high' in f else None
                    raw_value = f.get('numeric_value') if 'numeric_value' in f else f.get('value')
                    if isinstance(raw_value, (list, tuple)):
                        if len(raw_value) >= 2:
                            value_low, value_high = raw_value[0], raw_value[1]
                        elif len(raw_value) == 1:
                            raw_value = raw_value[0]

                    if value_low is not None or value_high is not None:
                        value_to_store = None
                    else:
                        value_to_store = raw_value

                    filters_to_store.append({
                        'operator': f.get('operator', 'eq'),
                        'operand': operand,
                        'filter_type': 'numeric',
                        'value': value_to_store,
                        'value_low': value_low,
                        'value_high': value_high,
                    })
            if categorical_filters:
                for f in categorical_filters:
                    operand = f.get('filter_name') or f.get('operand')
                    value = f.get('category_value') if 'category_value' in f else f.get('value')
                    filters_to_store.append({
                        'operator': f.get('operator', 'eq'),
                        'operand': operand,
                        'filter_type': 'categorical',
                        'value': value,
                        'value_low': None,
                        'value_high': None,
                    })

            custom_screener.filters = filters_to_store
            custom_screener.save()

        logging.info(f"Updated custom screener {screener_id} for user {user_id}")
        return custom_screener