import time
from typing import Any, Optional


class SimpleCache:
    
    def __init__(self, ttl_seconds: int = 7200):
        self.ttl = ttl_seconds
        self.store = {}
    
    def get(self, key: Any) -> Optional[Any]:
        entry = self.store.get(key)
        if not entry:
            return None
        
        value, timestamp = entry
        if int(time.time()) - timestamp > self.ttl:
            del self.store[key]
            return None
        
        return value
    
    def set(self, key: Any, value: Any) -> None:
        self.store[key] = (value, int(time.time()))
    
    def clear(self) -> None:
        self.store.clear()
