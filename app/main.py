from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.routers import websocket

# Get the base directory
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR.parent / "static"

# Create FastAPI app
app = FastAPI(
    title="MaxVision",
    description="WebGPU-powered vision application",
    version="0.1.0"
)

# Include routers (must be before static files mount for priority)
app.include_router(websocket.router)


@app.get("/")
async def index():
    """Serve the React app's index.html."""
    return FileResponse(STATIC_DIR / "index.html")

