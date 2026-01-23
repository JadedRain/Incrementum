from typing import List
from django.db.models import Q, OuterRef, Subquery
from Incrementum.DTOs.ifilterdata import FilterData
from Incrementum.models.stock import StockModel
from Incrementum.models.stock_history import StockHistory


class Screener:
    def query(self, filters: List[FilterData]) -> List[StockModel]:
        """
        Query stocks based on provided filters.

        Args:
            filters: List of FilterData objects to apply

        Returns:
            List of stocks matching the filter criteria
        """
        if not filters:
            return list(StockModel.objects.all())

        grouped_filters = {}
        for filter_data in filters:
            operand = filter_data.operand
            if operand not in grouped_filters:
                grouped_filters[operand] = []
            grouped_filters[operand].append(filter_data)
        # If any filter references 'pps' we need to annotate StockModel
        # with the latest StockHistory close_price so we can filter against it.
        needs_latest_pps = any(f.operand == 'pps' for f in filters)
        base_qs = StockModel.objects
        if needs_latest_pps:
            latest_history_qs = StockHistory.objects.filter(
                stock_symbol__symbol=OuterRef('symbol')
            ).order_by('-day_and_time')
            latest_close_subq = Subquery(latest_history_qs.values('close_price')[:1])
            base_qs = StockModel.objects.annotate(latest_close=latest_close_subq)

        combined_q = Q()
        for operand, filter_list in grouped_filters.items():
            if len(filter_list) == 1:
                q_obj = self._build_q_object(filter_list[0])
                if q_obj:
                    combined_q &= q_obj
            else:
                or_q = Q()
                for filter_data in filter_list:
                    q_obj = self._build_q_object(filter_data)
                    if q_obj:
                        or_q |= q_obj
                if or_q:
                    combined_q &= or_q

        return list(base_qs.filter(combined_q))

    def _build_q_object(self, filter_data: FilterData) -> Q:
        """
        Build a Django Q object for a single filter.

        Args:
            filter_data: FilterData object containing filter criteria

        Returns:
            Q object representing the filter condition
        """
        operand = filter_data.operand
        operator = filter_data.operator
        value = filter_data.value

        field_mapping = {
            'ticker': 'symbol',
            'price': 'market_cap',
            'pps': 'latest_close',
        }

        field_name = field_mapping.get(operand, operand)
        if operator == 'equals':
            if filter_data.filter_type == 'string':
                return Q(**{f'{field_name}__iexact': value})
            else:
                return Q(**{field_name: value})

        elif operator == 'greater_than':
            return Q(**{f'{field_name}__gt': value})

        elif operator == 'less_than':
            return Q(**{f'{field_name}__lt': value})

        elif operator == 'greater_than_or_equal':
            return Q(**{f'{field_name}__gte': value})

        elif operator == 'less_than_or_equal':
            return Q(**{f'{field_name}__lte': value})

        elif operator == 'contains':
            return Q(**{f'{field_name}__icontains': value})

        return Q()
