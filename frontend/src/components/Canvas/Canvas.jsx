import { useRef, useState, useEffect, useCallback } from 'react'
import styles from './Canvas.module.css'
import useWebGPU from './hooks/useWebGPU'
import useStreaming from './hooks/useStreaming'
import useCanvasInteractions from './hooks/useCanvasInteractions'

function Canvas({ recording, onStatusChange, onWsStatusChange, onFrequencyChange }) {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const [canvasHeight, setCanvasHeight] = useState(null)

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

    // Calculate canvas height from texture aspect ratio
    const recalcCanvasHeight = useCallback(() => {
        const container = containerRef.current
        if (!container || !textureWidthRef.current || !maxLinesRef.current) return

        const containerWidth = container.clientWidth
        const aspect = maxLinesRef.current / textureWidthRef.current
        const idealHeight = containerWidth * aspect
        const maxHeight = container.clientHeight

        setCanvasHeight(Math.min(idealHeight, maxHeight))
    }, [textureWidthRef, maxLinesRef])

    // Recalc on window resize
    useEffect(() => {
        const handleResize = () => recalcCanvasHeight()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [recalcCanvasHeight])

    // Wrap initWebGPU to recalc height after GPU init
    const initWebGPUAndResize = useCallback(async (width, maxLines) => {
        const result = await initWebGPU(width, maxLines)
        if (result) {
            // Wait a frame for layout to settle, then calculate height
            requestAnimationFrame(recalcCanvasHeight)
        }
        return result
    }, [initWebGPU, recalcCanvasHeight])

    useStreaming({
        recording,
        onStatusChange,
        onWsStatusChange,
        onFrequencyChange,
        gpuRef,
        initWebGPU: initWebGPUAndResize,
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
        <div ref={containerRef} className={styles.canvasContainer}>
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                style={canvasHeight ? { height: `${canvasHeight}px` } : undefined}
            />
        </div>
    )
}

export default Canvas
