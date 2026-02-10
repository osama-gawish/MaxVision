# MaxVision

A **WebGPU-powered vision application** for real-time image streaming and inspection. Built with a FastAPI backend and a React frontend, connected via WebSocket for live data flow.

---

## Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| **Backend**  | Python 3.14, FastAPI, Uvicorn           |
| **Frontend** | React 19, Vite 7                        |
| **Rendering**| WebGPU                                  |
| **Streaming**| WebSocket (`/ws/stream`)                |
| **Vision**   | OpenCV (server-side image processing)   |

## Project Structure

```
MaxVision/
├── app/                        # FastAPI backend
│   ├── main.py                 # App entry point, static file serving
│   ├── routers/
│   │   └── websocket.py        # WebSocket endpoint & connection manager
│   └── services/               # OpenCV & business logic (future)
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Root component, state management
│   │   ├── main.jsx            # React entry point
│   │   └── components/
│   │       ├── Canvas/         # WebGPU canvas for rendering
│   │       ├── Header/         # Sidebar header with title & controls
│   │       ├── StatusBar/      # WebSocket & GPU connection status
│   │       ├── RecordingToggle/# Start/Stop recording toggle
│   │       ├── ThemeToggle/    # Dark/Light theme switch
│   │       ├── Sidebar/        # Collapsible info panels
│   │       └── Panel/          # Grid content panels
│   └── vite.config.js          # Build output & dev proxy config
├── static/                     # Production build output (served by FastAPI)
├── tests/                      # Pytest test suite
└── pyproject.toml               # Python project config & dependencies
```

## Architecture

```
  React (Vite dev server :5173)          FastAPI (:8000)
  ┌──────────────────────────┐          ┌─────────────────────┐
  │  App.jsx                 │          │  main.py            │
  │   ├─ Canvas (WebGPU)     │◄── ws ──►│   └─ /ws/stream     │
  │   ├─ Header              │          │      (websocket.py) │
  │   ├─ StatusBar           │          │                     │
  │   └─ RecordingToggle     │          │  services/          │
  │                          │          │   └─ OpenCV (TBD)   │
  │  vite.config.js          │          │                     │
  │   proxy /ws  → :8000     │          │  static/ serving    │
  │   proxy /api → :8000     │          │   (production)      │
  └──────────────────────────┘          └─────────────────────┘
```

- **Development**: Vite proxies `/ws` and `/api` requests to the FastAPI server, avoiding CORS issues.
- **Production**: FastAPI serves the built React app directly from the `static/` directory.

## Getting Started

### Prerequisites

- **Python** ≥ 3.14
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

## Key Features

- **WebGPU Rendering** — hardware-accelerated canvas for image display
- **WebSocket Streaming** — real-time bidirectional data channel at `/ws/stream` with auto-reconnect
- **Recording Toggle** — UI control to start/stop canvas rendering
- **Dark / Light Theme** — persisted in `localStorage`
- **Modular Components** — each UI element is a self-contained React component with CSS Modules
