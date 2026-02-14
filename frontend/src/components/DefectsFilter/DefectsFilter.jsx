import styles from './DefectsFilter.module.css'

function DefectsFilter({ filters, onToggle }) {
    return (
        <div className={styles.filterList}>
            {Object.entries(filters).map(([key, checked]) => (
                <label key={key} className={styles.filterItem}>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(key)}
                        className={styles.filterCheckbox}
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
            ))}
        </div>
    )
}

export default DefectsFilter
