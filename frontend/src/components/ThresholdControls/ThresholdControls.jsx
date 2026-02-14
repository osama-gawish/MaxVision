import styles from './ThresholdControls.module.css'

const THRESHOLD_CONFIG = [
    { key: 'maskSize', label: 'Mask Size', step: 2 },
    { key: 'subtractValue', label: 'Subtract Value', step: 1 },
    { key: 'edgeThreshold', label: 'Edge Threshold', step: 1 },
    { key: 'transparency', label: 'Transparency', step: 5 },
]

function ThresholdControls({ thresholds, onUpdate, onSetValue }) {
    return (
        <div className={styles.thresholdList}>
            {THRESHOLD_CONFIG.map(({ key, label, step }) => (
                <div key={key} className={styles.thresholdItem}>
                    <span className={styles.thresholdLabel}>{label}</span>
                    <div className={styles.thresholdStepper}>
                        <button
                            className={styles.stepBtn}
                            onClick={() => onUpdate(key, -step)}
                            aria-label={`Decrease ${label}`}
                        >
                            −
                        </button>
                        <input
                            className={styles.thresholdInput}
                            type="number"
                            value={thresholds[key]}
                            onChange={(e) => onSetValue(key, e.target.value)}
                            min="0"
                        />
                        <button
                            className={styles.stepBtn}
                            onClick={() => onUpdate(key, step)}
                            aria-label={`Increase ${label}`}
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ThresholdControls
