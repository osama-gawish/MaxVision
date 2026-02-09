import styles from './Sidebar.module.css'

function Sidebar({ title, children }) {
    return (
        <aside className={styles.sidebar}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.content}>
                {children}
            </div>
        </aside>
    )
}

export default Sidebar
