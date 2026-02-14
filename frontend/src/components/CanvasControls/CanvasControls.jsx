import styles from './CanvasControls.module.css'

function CanvasControls({ recording, onRecordingToggle, frequency, totalLines, zoomScale }) {
    const frequencyLabel = Number.isFinite(frequency)
        ? `${frequency} lines/sec`
        : '—'

    return (
        <div className={styles.controls}>
            <div className={styles.buttons}>
                <button
                    className={`${styles.btn} ${recording ? styles.btnActive : ''}`}
                    onClick={onRecordingToggle}
                >
                    <span className={styles.indicator} />
                    {recording ? 'Recording' : 'Record'}
                </button>
                <button className={styles.btn}>
                    Detect Defects
                </button>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Frequency</span>
                    <span className={styles.statValue}>{frequencyLabel}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Lines Scanned</span>
                    <span className={styles.statValue}>{totalLines.toLocaleString()}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Zoom</span>
                    <span className={styles.statValue}>{zoomScale.toFixed(1)}×</span>
                </div>
            </div>
        </div>
    )
}

export default CanvasControls
