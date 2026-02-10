import styles from './StatusBar.module.css'

function StatusBar({ wsConnected, gpuStatus, frequency }) {
    const frequencyLabel = Number.isFinite(frequency)
        ? `${frequency} lines/sec`
        : '—'

    return (
        <div className={styles.statusBar}>
            <span className={styles.statusItem}>
                <span
                    className={wsConnected ? styles.statusDotConnected : styles.statusDotDisconnected}
                />
                WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className={styles.statusItem}>{gpuStatus}</span>
            <span className={styles.statusItem}>Freq: {frequencyLabel}</span>
        </div>
    )
}

export default StatusBar
