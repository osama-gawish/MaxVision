import asyncio
import contextlib
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services import line_scan

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket endpoint for streaming data."""
    await websocket.accept()
    stream_task = None
    stop_event = asyncio.Event()

    async def stream_lines():
        while not stop_event.is_set():
            line_bytes, line_index = line_scan.next_line_raw()
            await websocket.send_bytes(line_bytes)
            await asyncio.sleep(0.001)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                continue

            action = message.get("action")
            if action == "start":
                if stream_task is None or stream_task.done():
                    stop_event.clear()
                    await websocket.send_json({
                        "status": "recording",
                        "message": "Recording started",
                        "width": line_scan.line_width,
                        "maxLines": line_scan.MAX_HEIGHT,
                    })
                    stream_task = asyncio.create_task(stream_lines())
            elif action == "stop":
                stop_event.set()
                if stream_task is not None:
                    stream_task.cancel()
                    with contextlib.suppress(asyncio.CancelledError):
                        await stream_task
                await websocket.send_json({
                    "status": "stopped",
                    "message": "Recording stopped",
                })
    except WebSocketDisconnect:
        pass
    finally:
        stop_event.set()
        if stream_task is not None:
            stream_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await stream_task
