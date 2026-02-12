import { useEffect, useState, useCallback } from 'react'
import { Header, Canvas, Sidebar, Panel, RollInfoModal, DefectCountChart } from './components'
import styles from './App.module.css'

const DEFAULT_ROLL_INFO = {
  rollId: '',
  width: '',
  thickness: '',
  color: '',
}

const GRAPH_TABS = ['Defect Count', 'Graph B', 'Graph C', 'Graph D']

function App() {
  const [gpuStatus, setGpuStatus] = useState('Initializing...')
  const [wsConnected, setWsConnected] = useState(false)
  const [recording, setRecording] = useState(false)
  const [frequency, setFrequency] = useState(0)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [rollInfo, setRollInfo] = useState(DEFAULT_ROLL_INFO)
  const [showRollModal, setShowRollModal] = useState(false)
  const [detectionFilters, setDetectionFilters] = useState({
    gel: true,
    burn: true,
    wrinkle: true,
  })

  const toggleFilter = useCallback((key) => {
    setDetectionFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const [thresholds, setThresholds] = useState({
    maskSize: 5,
    subtractValue: 10,
    edgeThreshold: 30,
    transparency: 50,
  })

  const [activeGraph, setActiveGraph] = useState('Defect Count')

  // Defect counts per type (will be updated by detection logic later)
  const [defectCounts, setDefectCounts] = useState({
    gel: 12,
    burn: 5,
    wrinkle: 8,
  })

  const updateThreshold = useCallback((key, delta) => {
    setThresholds(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] ?? 0) + delta),
    }))
  }, [])

  const setThresholdValue = useCallback((key, value) => {
    const num = Number(value)
    if (value === '' || Number.isFinite(num)) {
      setThresholds(prev => ({ ...prev, [key]: value === '' ? '' : Math.max(0, num) }))
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  const toggleRecording = useCallback(() => {
    setRecording(prev => !prev)
  }, [])

  const handleRollInfoSave = useCallback((data) => {
    setRollInfo(data)
    setShowRollModal(false)
  }, [])

  return (
    <div className={styles.dashboard}>
      <Header
        wsConnected={wsConnected}
        gpuStatus={gpuStatus}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Info Panel: Roll Info + Filter */}
      <div className={styles.infoPanel}>
        <Sidebar title="Roll Info">
          <dl className={styles.rollInfoList}>
            <dt>Roll ID</dt>
            <dd>{rollInfo.rollId || '—'}</dd>
            <dt>Width</dt>
            <dd>{rollInfo.width ? `${rollInfo.width} mm` : '—'}</dd>
            <dt>Thickness</dt>
            <dd>{rollInfo.thickness ? `${rollInfo.thickness} mm` : '—'}</dd>
            <dt>Color</dt>
            <dd>{rollInfo.color || '—'}</dd>
          </dl>
          <button
            className={styles.modifyBtn}
            onClick={() => setShowRollModal(true)}
          >
            Modify
          </button>
        </Sidebar>
        <Sidebar title="Defects Filter">
          <div className={styles.filterList}>
            {Object.entries(detectionFilters).map(([key, checked]) => (
              <label key={key} className={styles.filterItem}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFilter(key)}
                  className={styles.filterCheckbox}
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            ))}
          </div>
        </Sidebar>
        <Sidebar title="Threshold Controls">
          <div className={styles.thresholdList}>
            {[
              { key: 'maskSize', label: 'Mask Size', step: 2 },
              { key: 'subtractValue', label: 'Subtract Value', step: 1 },
              { key: 'edgeThreshold', label: 'Edge Threshold', step: 1 },
              { key: 'transparency', label: 'Transparency', step: 5 },
            ].map(({ key, label, step }) => (
              <div key={key} className={styles.thresholdItem}>
                <span className={styles.thresholdLabel}>{label}</span>
                <div className={styles.thresholdStepper}>
                  <button
                    className={styles.stepBtn}
                    onClick={() => updateThreshold(key, -step)}
                    aria-label={`Decrease ${label}`}
                  >
                    −
                  </button>
                  <input
                    className={styles.thresholdInput}
                    type="number"
                    value={thresholds[key]}
                    onChange={(e) => setThresholdValue(key, e.target.value)}
                    min="0"
                  />
                  <button
                    className={styles.stepBtn}
                    onClick={() => updateThreshold(key, step)}
                    aria-label={`Increase ${label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Sidebar>
      </div>

      <main className={styles.main}>
        <Canvas
          recording={recording}
          onRecordingToggle={toggleRecording}
          onStatusChange={setGpuStatus}
          onWsStatusChange={setWsConnected}
          onFrequencyChange={setFrequency}
          frequency={frequency}
        />

        {/* Panels: 2 on top, 1 wide on bottom */}
        <div className={styles.panelsGrid}>
          <Panel title="Defects Thumbnails">
            <p>Defect images will appear here</p>
          </Panel>
          <Panel title="Graph 1">
            <p>Graph 1 content</p>
          </Panel>
          <Panel
            tabs={GRAPH_TABS}
            activeTab={activeGraph}
            onTabChange={setActiveGraph}
          >
            {activeGraph === 'Defect Count' && (
              <DefectCountChart defectCounts={defectCounts} />
            )}
            {activeGraph !== 'Defect Count' && (
              <p>{activeGraph} content</p>
            )}
          </Panel>
        </div>
      </main>

      {showRollModal && (
        <RollInfoModal
          rollInfo={rollInfo}
          onSave={handleRollInfoSave}
          onClose={() => setShowRollModal(false)}
        />
      )}
    </div>
  )
}

export default App
