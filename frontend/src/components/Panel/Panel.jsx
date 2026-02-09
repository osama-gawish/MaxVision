import styles from './Panel.module.css'

function Panel({ title, children }) {
    return (
        <div className={styles.panel}>
            <div className={styles.title}>{title}</div>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}

export default Panel
