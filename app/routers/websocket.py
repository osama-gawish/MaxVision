from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/ws", tags=["websocket"])


class ConnectionManager:
    """Manages WebSocket connections."""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_bytes(self, data: bytes, websocket: WebSocket):
        await websocket.send_bytes(data)
    
    async def broadcast_bytes(self, data: bytes):
        for connection in self.active_connections:
            await connection.send_bytes(data)


manager = ConnectionManager()


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket endpoint for streaming data."""
    await manager.connect(websocket)
    try:
        while True:
            # Receive data from client (if needed)
            data = await websocket.receive_text()
            # Echo back for now - replace with actual logic
            await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
