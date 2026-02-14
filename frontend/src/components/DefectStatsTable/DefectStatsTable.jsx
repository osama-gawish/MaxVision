import styles from './DefectStatsTable.module.css'

const DEFECT_COLORS = {
    gel: '#f59e0b',
    burn: '#ef4444',
    wrinkle: '#a855f7',
}

function DefectStatsTable({ defectStats }) {
    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Color</th>
                        <th>Name</th>
                        <th>Total Count</th>
                        <th>Average</th>
                        <th>Max Count/m</th>
                        <th>Location of Max</th>
                    </tr>
                </thead>
                <tbody>
                    {defectStats.map((row) => (
                        <tr key={row.name}>
                            <td>
                                <span
                                    className={styles.colorDot}
                                    style={{ background: DEFECT_COLORS[row.key] || row.color || '#888' }}
                                />
                            </td>
                            <td>{row.name}</td>
                            <td>{row.totalCount.toLocaleString()}</td>
                            <td>{row.average.toFixed(1)}</td>
                            <td>{row.maxCountPerM}</td>
                            <td>{row.locationOfMax}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default DefectStatsTable
