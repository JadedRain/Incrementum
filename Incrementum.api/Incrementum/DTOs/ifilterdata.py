class FilterData:
    def __init__(self, operator: str, operand: str, filter_type: str,
                 value: str | tuple[int, int] | int = None):
        self.operand = operand
        self.value = value
        self.operator = operator
        self.filter_type = filter_type
