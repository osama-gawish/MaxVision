from fastapi import FastAPI

from app.routers import websocket


# Create FastAPI app
app = FastAPI(
    title="MaxVision",
    description="WebGPU-powered vision application",
    version="0.1.0"
)

# Include routers (must be before static files mount for priority)
app.include_router(websocket.router)


