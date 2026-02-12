import { useState } from 'react'
import styles from './RollInfoModal.module.css'

function RollInfoModal({ rollInfo, onSave, onClose }) {
    const [form, setForm] = useState({ ...rollInfo })

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(form)
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Roll Information</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label}>
                        Roll ID
                        <input
                            className={styles.input}
                            type="text"
                            value={form.rollId}
                            onChange={handleChange('rollId')}
                            placeholder="e.g. R-20260212-001"
                        />
                    </label>

                    <label className={styles.label}>
                        Width (mm)
                        <input
                            className={styles.input}
                            type="number"
                            value={form.width}
                            onChange={handleChange('width')}
                            placeholder="e.g. 1500"
                            min="0"
                            step="any"
                        />
                    </label>

                    <label className={styles.label}>
                        Thickness (mm)
                        <input
                            className={styles.input}
                            type="number"
                            value={form.thickness}
                            onChange={handleChange('thickness')}
                            placeholder="e.g. 0.5"
                            min="0"
                            step="any"
                        />
                    </label>

                    <label className={styles.label}>
                        Color
                        <input
                            className={styles.input}
                            type="text"
                            value={form.color}
                            onChange={handleChange('color')}
                            placeholder="e.g. Natural"
                        />
                    </label>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveBtn}>
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RollInfoModal
