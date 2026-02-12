import styles from './StatusBar.module.css'

function StatusBar({ wsConnected, gpuStatus }) {
    return (
        <div className={styles.statusBar}>
            <span className={styles.statusItem}>
                <span
                    className={wsConnected ? styles.statusDotConnected : styles.statusDotDisconnected}
                />
                WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className={styles.statusItem}>{gpuStatus}</span>
        </div>
    )
}

export default StatusBar
