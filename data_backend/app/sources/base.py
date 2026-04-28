from __future__ import annotations

import abc
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any

from app.core.normalizer import NormalizedPlace


@dataclass
class FetchBatch:
    places: list[NormalizedPlace] = field(default_factory=list)
    fetched: int = 0
    skipped: int = 0
    errors: list[dict[str, Any]] = field(default_factory=list)


class BaseSource(abc.ABC):
    id: str
    title: str
    description: str
    requires_key: bool = False

    def is_configured(self) -> bool:
        return True

    @abc.abstractmethod
    def fetch(self, scope: str | None = None) -> AsyncIterator[FetchBatch]:
        """Возвращает итератор пакетов (для контроля памяти)."""
        raise NotImplementedError
