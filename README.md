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
|-- app/                           # FastAPI backend
|   |-- main.py                    # App entry point, static file serving
|   |-- routers/
|   |   `-- websocket.py           # WebSocket endpoint for line streaming
|   `-- services/
|       `-- line_scan.py           # Image loading + line-scan streaming logic
|-- frontend/                      # React + Vite frontend
|   |-- src/
|   |   |-- App.jsx                # Root component, layout & state orchestration
|   |   |-- App.module.css         # Dashboard layout styles
|   |   |-- main.jsx               # React entry point
|   |   `-- components/
|   |       |-- Canvas/            # WebGPU rendering + zoom/pan
|   |       |   |-- hooks/         # useWebGPU, useStreaming, useCanvasInteractions
|   |       |   `-- shaders/       # WGSL shader code
|   |       |-- CanvasControls/    # Record/Detect buttons + live stats
|   |       |-- DefectCountChart/  # Bar chart for defect counts per type
|   |       |-- DefectsFilter/     # Checkbox filters (gel, burn, wrinkle)
|   |       |-- Header/            # Vertical sidebar header (title, status, theme)
|   |       |-- Panel/             # Grid content panels (supports tabs)
|   |       |-- RollInfoModal/     # Modal form for editing roll information
|   |       |-- RollInfoSidebar/   # Roll data display + modify button
|   |       |-- Sidebar/           # Collapsible info panels
|   |       |-- StatusBar/         # WS/GPU connection status
|   |       |-- ThemeToggle/       # Dark/Light theme switch
|   |       `-- ThresholdControls/ # Stepper controls for detection thresholds
|   `-- vite.config.js             # Build output & dev proxy config
|-- static/                        # Production build output (served by FastAPI)
|-- tests/                         # Pytest test suite
`-- pyproject.toml                 # Python project config & dependencies
```

## Architecture

- React (Vite dev server `:5173`) renders the UI and the WebGPU canvas.
- The Record button (in Canvas Controls) opens a WebSocket to FastAPI at `/ws/stream`.
- FastAPI streams raw grayscale bytes (1 byte/pixel) as binary WebSocket frames.
- The frontend writes them directly into an `r8unorm` ring-buffer GPU texture via `writeTexture`.
- Render calls are throttled so only one `requestAnimationFrame` is queued at a time.
- In production, FastAPI serves the built React app from `static/`.

## Page Layout

```
┌────────┬────────┬─────────────────────┬──────────────────────────────┐
│        │        │                     │ Defects Thumbnails │ Graph 1 │
│        │ Info   │      Canvas         ├────────────────────┴─────────┤
│ Header │ Panel  │   (WebGPU r8unorm)  │ [Defect Count | B | C | D]  │
│ (vert) │(200px) │                     │  (tabbed graph panel)       │
│        │        ├─────────────────────┤                             │
│        │        │  Canvas Controls    │                             │
│        │        │  (Record + Stats)   │                             │
└────────┴────────┴─────────────────────┴──────────────────────────────┘
```

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

- **WebGPU Rendering** — hardware-accelerated `r8unorm` canvas sized to the texture aspect ratio
- **Binary Streaming** — raw grayscale bytes over binary WebSocket, zero encode/decode overhead
- **Render Throttling** — only one `requestAnimationFrame` queued at a time for high-frequency streams
- **Canvas Controls** — Record/Detect Defects buttons with live stats (frequency, total lines, zoom)
- **Defect Count Chart** — CSS bar chart showing per-type defect counts (Gel, Burn, Wrinkle)
- **Tabbed Panels** — Panel component supports static titles or switchable tab bars
- **Roll Info Modal** — form to set Roll ID, width, thickness, and color
- **Defects Filter** — toggle detection types on/off via checkboxes
- **Threshold Controls** — stepper inputs for mask size, subtract value, edge threshold, transparency
- **Zoom + Pan** — interactive inspection of the ring-buffer texture
- **Dark / Light Theme** — persisted in `localStorage`
- **Modular Components** — Canvas composed from custom hooks; all UI uses CSS Modules
