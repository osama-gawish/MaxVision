import { useEffect, useRef, useState } from 'react'
import styles from './App.module.css'

function App() {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('Initializing...')
  const [wsConnected, setWsConnected] = useState(false)
  const [theme, setTheme] = useState(() => {
    // Get saved theme or default to dark
    return localStorage.getItem('theme') || 'dark'
  })

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    // Initialize WebGPU
    async function initWebGPU() {
      if (!navigator.gpu) {
        setStatus('WebGPU not supported')
        return
      }

      try {
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) {
          setStatus('No GPU adapter found')
          return
        }

        const device = await adapter.requestDevice()
        const canvas = canvasRef.current
        const context = canvas.getContext('webgpu')

        const format = navigator.gpu.getPreferredCanvasFormat()
        context.configure({
          device,
          format,
          alphaMode: 'premultiplied',
        })

        setStatus('WebGPU Ready')
      } catch (err) {
        setStatus(`WebGPU Error: ${err.message}`)
      }
    }

    initWebGPU()
  }, [])

  useEffect(() => {
    // WebSocket connection
    const wsUrl = `ws://${window.location.host}/ws/stream`
    let ws = null

    function connect() {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        setWsConnected(true)
      }

      ws.onclose = () => {
        setWsConnected(false)
        // Reconnect after 2 seconds
        setTimeout(connect, 2000)
      }

      ws.onerror = () => {
        setWsConnected(false)
      }

      ws.onmessage = (event) => {
        // Handle incoming data
        console.log('Received:', event.data)
      }
    }

    connect()

    return () => {
      if (ws) ws.close()
    }
  }, [])

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>MaxVision</h1>
        <div className={styles.headerControls}>
          <div className={styles.statusBar}>
            <span className={styles.statusItem}>
              <span className={wsConnected ? styles.statusDotConnected : styles.statusDotDisconnected} />
              WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className={styles.statusItem}>{status}</span>
          </div>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.canvasContainer}>
          <canvas ref={canvasRef} className={styles.canvas} width={1200} height={600} />
        </div>
      </main>
    </div>
  )
}

export default App
