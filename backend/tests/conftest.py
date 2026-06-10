import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

# Ensure tables are created for tests if using an in-memory or sqlite db
Base.metadata.create_all(bind=engine)

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
