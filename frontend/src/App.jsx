import { useEffect, useState, useCallback } from 'react'
import { Header, Canvas, Sidebar, Panel, RollInfoModal, DefectCountChart } from './components'
import DefectStatsTable from './components/DefectStatsTable'
import RollInfoSidebar from './components/RollInfoSidebar'
import DefectsFilter from './components/DefectsFilter'
import ThresholdControls from './components/ThresholdControls'
import styles from './App.module.css'

const DEFAULT_ROLL_INFO = {
  rollId: '',
  width: '',
  thickness: '',
  color: '',
}

const GRAPH_TABS = ['Defect Count', 'Defect Statistics', 'Graph C', 'Graph D']

function App() {
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

  // Defect statistics per type (will be driven by backend later)
  const [defectStats] = useState([
    { key: 'gel', name: 'Gel', totalCount: 12, average: 2.4, maxCountPerM: 5, locationOfMax: '14.2 m' },
    { key: 'burn', name: 'Burn', totalCount: 5, average: 1.0, maxCountPerM: 3, locationOfMax: '8.7 m' },
    { key: 'wrinkle', name: 'Wrinkle', totalCount: 8, average: 1.6, maxCountPerM: 4, locationOfMax: '22.1 m' },
  ])

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
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Info Panel: Roll Info + Filter */}
      <div className={styles.infoPanel}>
        <Sidebar title="Roll Info">
          <RollInfoSidebar rollInfo={rollInfo} onModify={() => setShowRollModal(true)} />
        </Sidebar>
        <Sidebar title="Defects Filter">
          <DefectsFilter filters={detectionFilters} onToggle={toggleFilter} />
        </Sidebar>
        <Sidebar title="Threshold Controls">
          <ThresholdControls
            thresholds={thresholds}
            onUpdate={updateThreshold}
            onSetValue={setThresholdValue}
          />
        </Sidebar>
      </div>

      <main className={styles.main}>
        <Canvas
          recording={recording}
          onRecordingToggle={toggleRecording}
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
            {activeGraph === 'Defect Statistics' && (
              <DefectStatsTable defectStats={defectStats} />
            )}
            {activeGraph !== 'Defect Count' && activeGraph !== 'Defect Statistics' && (
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
