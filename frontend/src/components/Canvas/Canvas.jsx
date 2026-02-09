import { useEffect, useRef } from 'react'
import styles from './Canvas.module.css'

function Canvas({ onStatusChange }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        async function initWebGPU() {
            if (!navigator.gpu) {
                onStatusChange?.('WebGPU not supported')
                return
            }

            try {
                const adapter = await navigator.gpu.requestAdapter()
                if (!adapter) {
                    onStatusChange?.('No GPU adapter found')
                    return
                }

                const device = await adapter.requestDevice()
                const canvas = canvasRef.current
                const context = canvas.getContext('webgpu')

                const format = navigator.gpu.getPreferredCanvasFormat()
                context.configure({
                    device,
                    format,
                    alphaMode: 'premultiplied',
                })

                onStatusChange?.('WebGPU Ready')
            } catch (err) {
                onStatusChange?.(`WebGPU Error: ${err.message}`)
            }
        }

        initWebGPU()
    }, [onStatusChange])

    return (
        <div className={styles.canvasContainer}>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                width={1200}
                height={600}
            />
        </div>
    )
}

export default Canvas
