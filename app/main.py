from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from pathlib import Path

from app.routers import websocket

# Get the base directory
BASE_DIR = Path(__file__).resolve().parent

# Create FastAPI app
app = FastAPI(
    title="MaxVision",
    description="WebGPU-powered vision application",
    version="0.1.0"
)

# Mount static files
app.mount("/static", StaticFiles(directory=BASE_DIR.parent / "static"), name="static")

# Setup Jinja2 templates
templates = Jinja2Templates(directory=BASE_DIR / "templates")

# Include routers
app.include_router(websocket.router)


@app.get("/")
async def index(request: Request):
    """Render the main index page."""
    return templates.TemplateResponse(
        request,
        "index.html",
        {"title": "MaxVision"}
    )
