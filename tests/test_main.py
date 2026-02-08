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


def test_index_returns_html(client):
    """Test that the index page returns HTML content."""
    response = client.get("/")
    assert "text/html" in response.headers.get("content-type", "")


def test_static_assets_accessible(client):
    """Test that static assets from React build are accessible."""
    # The assets directory should exist after build
    response = client.get("/vite.svg")
    assert response.status_code == 200
