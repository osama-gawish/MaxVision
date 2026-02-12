import styles from './RecordingToggle.module.css'

function RecordingToggle({ recording, onToggle }) {
    return (
        <button
            className={`${styles.recordingToggle} ${recording ? styles.active : ''}`}
            onClick={onToggle}
            aria-label="Toggle recording"
            title={recording ? 'Stop Recording' : 'Start Recording'}
        >
            <span className={styles.indicator} />
            <span className={styles.label}>
                {recording ? 'Recording' : 'Record'}
            </span>
        </button>
    )
}

export default RecordingToggle
