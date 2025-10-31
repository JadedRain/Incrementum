import threading
from django.apps import AppConfig


class HelloConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hello'

    def ready(self):
        from hello.utils import fetch_and_update_symbols
        thread = threading.Thread(target=fetch_and_update_symbols, daemon=True)
        thread.start()
        return super().ready()