import styles from './Panel.module.css'

function Panel({ title, tabs, activeTab, onTabChange, children }) {
    return (
        <div className={styles.panel}>
            {tabs ? (
                <div className={styles.tabBar}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                            onClick={() => onTabChange(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            ) : (
                <div className={styles.title}>{title}</div>
            )}
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}

export default Panel
