# MaxVision

A **WebGPU-powered line-scan vision application** for real-time image streaming and inspection. Built with a FastAPI backend and a React frontend, connected via WebSocket for live data flow.

---

## Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| **Backend**  | Python 3.14, FastAPI, Uvicorn                     |
| **Frontend** | React 19, Vite 7                                  |
| **Rendering**| WebGPU                                            |
| **Streaming**| WebSocket (`/ws/stream`, binary frames)            |
| **Vision**   | OpenCV (line-scan preprocessing)                  |

## Project Structure

```
MaxVision/
|-- app/                        # FastAPI backend
|   |-- main.py                 # App entry point, static file serving
|   |-- routers/
|   |   `-- websocket.py        # WebSocket endpoint for line streaming
|   `-- services/
|       `-- line_scan.py        # Image loading + line-scan streaming logic
|-- frontend/                   # React + Vite frontend
|   |-- src/
|   |   |-- App.jsx             # Root component, state management
|   |   |-- main.jsx            # React entry point
|   |   `-- components/
|   |       |-- Canvas/         # WebGPU rendering + zoom/pan
|   |       |   |-- hooks/      # useWebGPU, useStreaming, useCanvasInteractions
|   |       |   `-- shaders/    # WGSL shader code
|   |       |-- Header/         # Top header and controls
|   |       |-- StatusBar/      # WS/GPU status + frequency
|   |       |-- RecordingToggle/# Start/Stop recording toggle
|   |       |-- ThemeToggle/    # Dark/Light theme switch
|   |       |-- Sidebar/        # Collapsible info panels
|   |       `-- Panel/          # Grid content panels
|   `-- vite.config.js          # Build output & dev proxy config
|-- static/                     # Production build output (served by FastAPI)
|-- tests/                      # Pytest test suite
`-- pyproject.toml              # Python project config & dependencies
```

## Architecture

- React (Vite dev server `:5173`) renders the UI and the WebGPU canvas.
- The recording toggle opens a WebSocket to FastAPI at `/ws/stream`.
- FastAPI streams raw grayscale bytes (1 byte/pixel) as binary WebSocket frames.
- The frontend writes them directly into an `r8unorm` ring-buffer GPU texture via `writeTexture`.
- In production, FastAPI serves the built React app from `static/`.

## Getting Started

### Prerequisites

- **Python** >= 3.14
- **Node.js** (for the frontend)
- **uv** (Python package manager)

### Backend

```bash
# Install dependencies
uv sync

# Start the server
uv run uvicorn app.main:app --reload
```

The API runs at **http://127.0.0.1:8000**.

### Configuration

- Optional: set `LINE_SCAN_IMAGE_PATH` to point to the image used for line scanning.
- If not set or the file is missing, a dummy grayscale image is used.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at **http://localhost:5173**.

### Production Build

```bash
cd frontend
npm run build
```

This outputs to `static/`, which FastAPI serves automatically.

## WebSocket Protocol

Client -> Server

- `{"action": "start"}`
- `{"action": "stop"}`

Server -> Client (JSON text frames)

- `{"status":"recording","message":"Recording started","width":<int>,"maxLines":<int>}`
- `{"status":"stopped","message":"Recording stopped"}`

Server -> Client (binary frames)

- Raw grayscale bytes (`width` bytes per frame, 1 byte/pixel) written directly into the WebGPU `r8unorm` ring-buffer texture.

## Controls

- Mouse wheel: zoom toward cursor.
- Click + drag: pan.
- Double-click: reset zoom and pan.

## Key Features

- **WebGPU Rendering** — hardware-accelerated `r8unorm` canvas for grayscale line-scan display
- **Binary Streaming** — raw grayscale bytes over binary WebSocket, zero encode/decode overhead
- **Recording Toggle** — UI control to start/stop streaming and rendering
- **Zoom + Pan** — interactive inspection of the ring-buffer texture
- **Frequency Indicator** — live lines/sec display in the StatusBar
- **Dark / Light Theme** — persisted in `localStorage`
- **Modular Components** — Canvas is composed from custom hooks (`useWebGPU`, `useStreaming`, `useCanvasInteractions`); all UI elements use CSS Modules
