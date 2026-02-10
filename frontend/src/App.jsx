import { useEffect, useState, useCallback } from 'react'
import { Header, Canvas, Sidebar, Panel } from './components'
import styles from './App.module.css'

function App() {
  const [gpuStatus, setGpuStatus] = useState('Initializing...')
  const [wsConnected, setWsConnected] = useState(false)
  const [recording, setRecording] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  const handleGpuStatusChange = useCallback((status) => {
    setGpuStatus(status)
  }, [])

  const toggleRecording = useCallback(() => {
    setRecording(prev => !prev)
  }, [])

  // WebSocket connection
  useEffect(() => {
    const wsUrl = `ws://${window.location.host}/ws/stream`
    let ws = null

    function connect() {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => {
        setWsConnected(false)
        setTimeout(connect, 2000)
      }
      ws.onerror = () => setWsConnected(false)
      ws.onmessage = (event) => {
        console.log('Received:', event.data)
      }
    }

    connect()
    return () => { if (ws) ws.close() }
  }, [])

  return (
    <div className={styles.dashboard}>
      <Header
        wsConnected={wsConnected}
        gpuStatus={gpuStatus}
        theme={theme}
        onThemeToggle={toggleTheme}
        recording={recording}
        onRecordingToggle={toggleRecording}
      />

      {/* Info Panel: Roll Info + Filter */}
      <div className={styles.infoPanel}>
        <Sidebar title="Roll Info">
          <p>Roll data will appear here</p>
        </Sidebar>
        <Sidebar title="Filter">
          <p>Filter options will appear here</p>
        </Sidebar>
      </div>

      <main className={styles.main}>
        <Canvas onStatusChange={handleGpuStatusChange} />

        {/* 2x2 Grid: Defects Thumbnails + Graphs */}
        <div className={styles.panelsGrid}>
          <Panel title="Defects Thumbnails">
            <p>Defect images will appear here</p>
          </Panel>
          <Panel title="Graph 1">
            <p>Graph 1 content</p>
          </Panel>
          <Panel title="Graph 2">
            <p>Graph 2 content</p>
          </Panel>
          <Panel title="Graph 3">
            <p>Graph 3 content</p>
          </Panel>
        </div>
      </main>
    </div>
  )
}

export default App
