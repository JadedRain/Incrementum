import threading
from django.apps import AppConfig


class IncrementumConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Incrementum'

    def ready(self):
        from Incrementum.utils import fetch_and_update_symbols
        thread = threading.Thread(target=fetch_and_update_symbols, daemon=True)
        thread.start()
        return super().ready()
