import StatusBar from '../StatusBar'
import RecordingToggle from '../RecordingToggle'
import ThemeToggle from '../ThemeToggle'
import styles from './Header.module.css'

function Header({
    wsConnected,
    gpuStatus,
    frequency,
    theme,
    onThemeToggle,
    recording,
    onRecordingToggle
}) {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>MaxVision</h1>
            <div className={styles.headerControls}>
                <StatusBar wsConnected={wsConnected} gpuStatus={gpuStatus} frequency={frequency} />
                <RecordingToggle recording={recording} onToggle={onRecordingToggle} />
                <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            </div>
        </header>
    )
}

export default Header
