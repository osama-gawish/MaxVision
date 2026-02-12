import styles from './DefectCountChart.module.css'

const BAR_CONFIG = {
    gel: { label: 'Gel', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
    burn: { label: 'Burn', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
    wrinkle: { label: 'Wrinkle', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)' },
}

function DefectCountChart({ defectCounts = {} }) {
    const entries = Object.entries(defectCounts)
    const maxCount = Math.max(1, ...entries.map(([, v]) => v))
    const total = entries.reduce((sum, [, v]) => sum + v, 0)

    // Generate grid line values (4 lines evenly spaced)
    const gridLines = Array.from({ length: 4 }, (_, i) =>
        Math.round((maxCount * (i + 1)) / 4)
    )

    return (
        <div className={styles.chart}>
            {/* Y-axis grid lines */}
            <div className={styles.gridOverlay}>
                {gridLines.map(val => (
                    <div
                        key={val}
                        className={styles.gridLine}
                        style={{ bottom: `${(val / maxCount) * 100}%` }}
                    >
                        <span className={styles.gridLabel}>{val}</span>
                    </div>
                ))}
            </div>

            {/* Bars */}
            <div className={styles.barsArea}>
                {entries.map(([type, count]) => {
                    const cfg = BAR_CONFIG[type] || { label: type, color: 'var(--text-secondary)', glow: 'transparent' }
                    const pct = (count / maxCount) * 100
                    return (
                        <div key={type} className={styles.barGroup}>
                            <div className={styles.barTrack}>
                                <div
                                    className={styles.barFill}
                                    style={{
                                        height: `${pct}%`,
                                        background: `linear-gradient(to top, ${cfg.color}, ${cfg.color}cc)`,
                                        boxShadow: `0 0 12px ${cfg.glow}`,
                                    }}
                                >
                                    <span className={styles.barValue}>{count}</span>
                                </div>
                            </div>
                            <div className={styles.labelArea}>
                                <span
                                    className={styles.dot}
                                    style={{ background: cfg.color }}
                                />
                                <span className={styles.label}>{cfg.label}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Total badge */}
            <div className={styles.totalBadge}>
                <span className={styles.totalCount}>{total}</span>
                <span className={styles.totalLabel}>Total</span>
            </div>
        </div>
    )
}

export default DefectCountChart
