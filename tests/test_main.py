import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


def test_index_returns_200(client):
    """Test that the index page returns a 200 status code."""
    response = client.get("/")
    assert response.status_code == 200


def test_index_contains_title(client):
    """Test that the index page contains the expected title."""
    response = client.get("/")
    assert "MaxVision" in response.text
