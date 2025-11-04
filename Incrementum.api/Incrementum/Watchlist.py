from abc import ABC, abstractmethod

class Watchlist(ABC):
    @abstractmethod
    def add_item(self, item):
        """Add an item/method to the watchlist."""
        pass

    @abstractmethod
    def remove_item(self, item):
        """Remove an item from the watchlist."""
        pass

    @abstractmethod
    def get_items(self):
        """Retrieve all items in the watchlist."""
        pass

class SimpleWatchlist(Watchlist):
    def __init__(self):
        self.items = []

    def add_item(self, item):
        if item not in self.items:
            self.items.append(item)

    def remove_item(self, item):
        if item in self.items:
            self.items.remove(item)

    def get_items(self):
        return self.items
    

    