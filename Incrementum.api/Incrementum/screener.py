from typing import List
import re
from django.db.models import Q, OuterRef, Subquery
from Incrementum.DTOs.ifilterdata import FilterData
from Incrementum.models.stock import StockModel
from Incrementum.models.stock_history import StockHistory
import logging

logger = logging.getLogger(__name__)


class Screener:
    def query(self, filters: List[FilterData],
              sort_by: str = None, sort_order: str = 'asc',
              page: int = 1, page_size: int | None = None) -> tuple[List[StockModel], int]:

        if not filters:
            base_qs = StockModel.objects.order_by('symbol')
            total = base_qs.count()
            if page_size:
                offset = (max(page, 1) - 1) * page_size
                qs = base_qs[offset: offset + page_size]
            else:
                qs = base_qs
            return list(qs), total

        grouped_filters = {}
        for filter_data in filters:
            operand = filter_data.operand
            if operand not in grouped_filters:
                grouped_filters[operand] = []
            grouped_filters[operand].append(filter_data)

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
                all_numeric = all(getattr(f, 'filter_type', None) == 'numeric' for f in filter_list)
                if all_numeric:
                    and_q = Q()
                    for filter_data in filter_list:
                        q_obj = self._build_q_object(filter_data)
                        if q_obj:
                            and_q &= q_obj
                    if and_q:
                        combined_q &= and_q
                else:
                    or_q = Q()
                    for filter_data in filter_list:
                        logger.error(filter_data)
                        q_obj = self._build_q_object(filter_data)
                        if q_obj:
                            or_q |= q_obj
                            logger.error(or_q)
                    if or_q:
                        combined_q &= or_q

        logger.info(f"Final query: {combined_q}")
        qs = base_qs.filter(combined_q)
        if sort_by:
            order = '' if sort_order == 'asc' else '-'
            qs = qs.order_by(f'{order}{sort_by}')
        else:
            qs = qs.order_by('symbol')
        total = qs.count()
        if page_size:
            offset = (max(page, 1) - 1) * page_size
            qs = qs[offset: offset + page_size]
        result = list(qs)
        logger.info(f"Query returned {len(result)} stocks (total {total})")
        return result, total

    def _build_q_object(self, filter_data: FilterData) -> Q:
        operand = filter_data.operand
        operator = filter_data.operator
        value = filter_data.value

        field_mapping = {
            'ticker': 'symbol',
            'market_cap': 'market_cap',
            'pps': 'latest_close',
            'industry': 'sic_description',
        }

        field_name = field_mapping.get(operand, operand)
        if operator == 'equals':
            if filter_data.filter_type in ['categoric', 'string']:
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
            if isinstance(value, str) and '*' in value:
                parts = [re.escape(part) for part in value.split('*')]
                pattern = '^' + '.*'.join(parts) + '$'
                return Q(**{f'{field_name}__iregex': pattern})
            return Q(**{f'{field_name}__icontains': value})

        return Q()
