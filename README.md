# MaxVision

A **WebGPU-powered line-scan vision application** for real-time image streaming and inspection. Built with a FastAPI backend and a React frontend, connected via WebSocket for live data flow.

---

## Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| **Backend**  | Python 3.14, FastAPI, Uvicorn                     |
| **Frontend** | React 19, Vite 7                                  |
| **Rendering**| WebGPU                                            |
| **Streaming**| WebSocket (`/ws/stream`, JSON + base64 PNG lines) |
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
- FastAPI streams 1-pixel-tall line images, which the canvas writes into a ring-buffer texture.
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

Server -> Client

- `{"status":"recording","message":"Recording started","width":<int>,"maxLines":1200}`
- `{"status":"stopped","message":"Recording stopped"}`
- `{"type":"line","data":"<base64 PNG>","lineIndex":<int>}`

Each `line` message contains a 1-pixel-high grayscale PNG row that is written into the WebGPU ring buffer.

## Controls

- Mouse wheel: zoom toward cursor.
- Click + drag: pan.
- Double-click: reset zoom and pan.

## Key Features

- **WebGPU Rendering** — hardware-accelerated canvas for line-scan display
- **Line-Scan Streaming** — server streams 1-pixel rows via WebSocket at `/ws/stream`
- **Recording Toggle** — UI control to start/stop streaming and rendering
- **Zoom + Pan** — interactive inspection of the ring-buffer texture
- **Frequency Indicator** — live lines/sec display in the StatusBar
- **Dark / Light Theme** — persisted in `localStorage`
- **Modular Components** — each UI element is a self-contained React component with CSS Modules
