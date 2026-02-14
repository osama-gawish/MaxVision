import { useRef, useState, useEffect, useCallback } from 'react'
import styles from './Canvas.module.css'
import useWebGPU from './hooks/useWebGPU'
import useStreaming from './hooks/useStreaming'
import useCanvasInteractions from './hooks/useCanvasInteractions'
import CanvasControls from '../CanvasControls'

function Canvas({ recording, onRecordingToggle, onFrequencyChange, frequency }) {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const [canvasHeight, setCanvasHeight] = useState(null)
    const [displayStats, setDisplayStats] = useState({ totalLines: 0, zoomScale: 1.0 })

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
    } = useWebGPU(canvasRef)

    // Sync ref values to display state periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setDisplayStats({
                totalLines: currentLineIndexRef.current,
                zoomScale: zoomScaleRef.current,
            })
        }, 200)
        return () => clearInterval(interval)
    }, [currentLineIndexRef, zoomScaleRef])

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
            requestAnimationFrame(recalcCanvasHeight)
        }
        return result
    }, [initWebGPU, recalcCanvasHeight])

    useStreaming({
        recording,
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
            <CanvasControls
                recording={recording}
                onRecordingToggle={onRecordingToggle}
                frequency={frequency}
                totalLines={displayStats.totalLines}
                zoomScale={displayStats.zoomScale}
            />
        </div>
    )
}

export default Canvas
