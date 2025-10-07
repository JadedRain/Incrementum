import logging
from .models import CustomScreener, NumericFilter, CategoricalFilter, CustomScreenerNumeric, CustomScreenerCategorical
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

        try:
            with transaction.atomic():
                final_name = name or 'Untitled Screener'
                print(f"DEBUG SERVICE: Creating screener with name: {final_name}")
                custom_screener = CustomScreener.objects.create(
                    account=account,
                    screener_name=final_name
                )
                
                if numeric_filters:
                    for filter_data in numeric_filters:
                        filter_name = filter_data.get('filter_name')
                        value = filter_data.get('numeric_value')
                        
                        numeric_filter, _ = NumericFilter.objects.get_or_create(name=filter_name)
                        
                        CustomScreenerNumeric.objects.create(
                            custom_screener=custom_screener,
                            numeric_filter=numeric_filter,
                            numeric_value=value
                        )
                
                if categorical_filters:
                    for filter_data in categorical_filters:
                        filter_name = filter_data.get('filter_name')
                        value = filter_data.get('category_value')
                        
                        categorical_filter, _ = CategoricalFilter.objects.get_or_create(name=filter_name)
                        logging.info("adding this {value}, {filter_name}")
                        CustomScreenerCategorical.objects.create(
                            custom_screener=custom_screener,
                            categorical_filter=categorical_filter,
                            category_value = value
                            )
                
                logging.info(f"Created custom screener {custom_screener.id} for user {user_id}")
                return custom_screener
                
        except Exception as e:
            logging.error(f"Failed to create custom screener for user {user_id}: {str(e)}")
            return None
        # def get_custom_screener(self, screener_id, api_key: str):
        #     try:
        #         # Fetch the account for the given API key
        #         account = Account.objects.get(api_key=api_key)
        #     except Account.DoesNotExist:
        #         raise ValueError(f"Invalid API key: {api_key}")

        #     try:
        #         # Fetch the custom screener and ensure it belongs to this account
        #         custom_screener = CustomScreener.objects.get(id=screener_id, account=account)
        #     except CustomScreener.DoesNotExist:
        #         raise ValueError(f"Screener not found or access denied for API key: {api_key}")

        #     # Fetch numeric filters
        #     numeric_filters = CustomScreenerNumeric.objects.filter(
        #         custom_screener=custom_screener
        #     ).select_related('numeric_filter')

        #     numeric_data = [
        #         {
        #             "filter_name": nf.numeric_filter.name,
        #             "value": nf.value
        #         }
        #         for nf in numeric_filters
        #     ]

        #     # Fetch categorical filters
        #     categorical_filters = CustomScreenerCategorical.objects.filter(
        #         custom_screener=custom_screener
        #     ).select_related('categorical_filter')

        #     categorical_data = [
        #         {
        #             "filter_name": cf.categorical_filter.name,
        #             "value": cf.categorical_value  # your field name
        #         }
        #         for cf in categorical_filters
        #     ]

        #     # Build final JSON
        #     result = {
        #         "id": custom_screener.id,
        #         "name": custom_screener.screener_name,
        #         "numeric_filters": numeric_data,
        #         "categorical_filters": categorical_data
        #     }

        #     return result

        # except CustomScreener.DoesNotExist:
        #     logging.error(f"Custom screener {screener_id} does not exist.")
        #     return None

        # except Exception as e:
        #     logging.error(f"Failed to retrieve custom screener {screener_id}: {str(e)}")
        #     return None

    def get_custom_screener(self, user_id, screener_id):
        account = Account.objects.get(api_key=user_id)
        custom_screener = CustomScreener.objects.get(id=screener_id, account=account)
        
        numeric_filters = []
        for csn in CustomScreenerNumeric.objects.filter(custom_screener=custom_screener):
            numeric_filters.append({
                'filter_name': csn.numeric_filter.name,
                'value': csn.numeric_value
            })
        
        categorical_filters = []
        for csc in CustomScreenerCategorical.objects.filter(custom_screener=custom_screener):
            categorical_filters.append({
                'filter_name': csc.categorical_filter.name,
                'value': csc.category_value
            })
        
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
            numeric_count = CustomScreenerNumeric.objects.filter(custom_screener=custom_screener).count()
            categorical_count = CustomScreenerCategorical.objects.filter(custom_screener=custom_screener).count()
            
            screeners.append({
                'id': custom_screener.id,
                'screener_name': custom_screener.screener_name,
                'created_at': custom_screener.created_at.isoformat(),
                'filter_count': numeric_count + categorical_count
            })
        
        return screeners

    def delete_custom_screener(self, user_id, screener_id):
        account = Account.objects.get(api_key=user_id)
        custom_screener = CustomScreener.objects.get(id=screener_id, account=account)
        
        with transaction.atomic():
            CustomScreenerNumeric.objects.filter(custom_screener=custom_screener).delete()
            CustomScreenerCategorical.objects.filter(custom_screener=custom_screener).delete()
            
            custom_screener.delete()
            
            logging.info(f"Deleted custom screener {screener_id} for user {user_id}")
            return True
                

    def update_custom_screener(self, user_id, screener_id, numeric_filters=None, categorical_filters=None):
        account = Account.objects.get(api_key=user_id)
        custom_screener = CustomScreener.objects.get(id=screener_id, account=account)
        
        with transaction.atomic():
            CustomScreenerNumeric.objects.filter(custom_screener=custom_screener).delete()
            CustomScreenerCategorical.objects.filter(custom_screener=custom_screener).delete()
            
            if numeric_filters:
                for filter_data in numeric_filters:
                    filter_name = filter_data.get('filter_name')
                    value = filter_data.get('numeric_value')
                    
                    numeric_filter, _ = NumericFilter.objects.get_or_create(name=filter_name)
                    CustomScreenerNumeric.objects.create(
                        custom_screener=custom_screener,
                        numeric_filter=numeric_filter,
                        numeric_value=value
                    )
            
            if categorical_filters:
                for filter_data in categorical_filters:
                    filter_name = filter_data.get('filter_name')
                    value = filter_data.get('category_value')
                    
                    categorical_filter, _ = CategoricalFilter.objects.get_or_create(name=filter_name)
                    CustomScreenerCategorical.objects.create(
                        custom_screener=custom_screener,
                        categorical_filter=categorical_filter,
                        category_value=value
                    )
            
            logging.info(f"Updated custom screener {screener_id} for user {user_id}")
            return custom_screener
                