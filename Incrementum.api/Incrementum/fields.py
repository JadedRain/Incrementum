import json
from django.db import models


class FlexibleJSONField(models.JSONField):
    def from_db_value(self, value, expression, connection):

        if value is None:
            return value

        # If it's already a list or dict, it's been auto-deserialized by psycopg2
        if isinstance(value, (list, dict)):
            return value

        # If it's a string, deserialize it
        if isinstance(value, str):
            try:
                return json.loads(value, cls=self.decoder)
            except json.JSONDecodeError:
                return value

        # For any other type, return as-is
        return value
