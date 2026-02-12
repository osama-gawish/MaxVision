import styles from './ThemeToggle.module.css'

function ThemeToggle({ theme, onToggle }) {
    return (
        <button
            className={styles.themeToggle}
            onClick={onToggle}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    )
}

export default ThemeToggle
