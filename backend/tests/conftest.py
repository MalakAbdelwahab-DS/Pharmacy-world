"""Tests run against a database loaded with the sample data (set DATABASE_URL)."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    return TestClient(app)
