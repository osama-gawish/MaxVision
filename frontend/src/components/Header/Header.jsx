import ThemeToggle from '../ThemeToggle'
import styles from './Header.module.css'

function Header({ theme, onThemeToggle }) {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>MaxVision</h1>
            <div className={styles.headerControls}>
                <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            </div>
        </header>
    )
}

export default Header
