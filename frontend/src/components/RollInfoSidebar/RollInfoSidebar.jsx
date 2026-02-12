import styles from './RollInfoSidebar.module.css'

function RollInfoSidebar({ rollInfo, onModify }) {
    return (
        <>
            <dl className={styles.rollInfoList}>
                <dt>Roll ID</dt>
                <dd>{rollInfo.rollId || '—'}</dd>
                <dt>Width</dt>
                <dd>{rollInfo.width ? `${rollInfo.width} mm` : '—'}</dd>
                <dt>Thickness</dt>
                <dd>{rollInfo.thickness ? `${rollInfo.thickness} mm` : '—'}</dd>
                <dt>Color</dt>
                <dd>{rollInfo.color || '—'}</dd>
            </dl>
            <button className={styles.modifyBtn} onClick={onModify}>
                Modify
            </button>
        </>
    )
}

export default RollInfoSidebar
