import { useRef } from 'react'
import styles from './Canvas.module.css'
import useWebGPU from './hooks/useWebGPU'
import useStreaming from './hooks/useStreaming'
import useCanvasInteractions from './hooks/useCanvasInteractions'

function Canvas({ recording, onStatusChange, onWsStatusChange, onFrequencyChange }) {
    const canvasRef = useRef(null)

    const {
        gpuRef,
        initWebGPU,
        updateUniforms,
        render,
        textureWidthRef,
        maxLinesRef,
        currentLineIndexRef,
        zoomScaleRef,
        panOffsetXRef,
        panOffsetYRef,
    } = useWebGPU(canvasRef, onStatusChange)

    useStreaming({
        recording,
        onStatusChange,
        onWsStatusChange,
        onFrequencyChange,
        gpuRef,
        initWebGPU,
        updateUniforms,
        render,
        currentLineIndexRef,
        textureWidthRef,
        maxLinesRef,
    })

    useCanvasInteractions({
        canvasRef,
        zoomScaleRef,
        panOffsetXRef,
        panOffsetYRef,
        currentLineIndexRef,
        maxLinesRef,
        updateUniforms,
        render,
    })

    return (
        <div className={styles.canvasContainer}>
            <canvas ref={canvasRef} className={styles.canvas} />
        </div>
    )
}

export default Canvas
