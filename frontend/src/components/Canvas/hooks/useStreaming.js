import { useCallback, useEffect, useRef } from 'react'
import { DEFAULT_MAX_LINES } from '../shaders/lineScanShader'

export default function useStreaming({
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
}) {
    const wsRef = useRef(null)
    const lastFrequencyTimeRef = useRef(0)
    const lastFrequencyLineCountRef = useRef(0)

    const startStreaming = useCallback(() => {
        if (wsRef.current) return

        const wsUrl = `ws://${window.location.host}/ws/stream`
        const ws = new WebSocket(wsUrl)
        ws.binaryType = 'arraybuffer'
        wsRef.current = ws

        ws.onopen = () => {
            onWsStatusChange?.(true)
            onFrequencyChange?.(0)
            ws.send(JSON.stringify({ action: 'start' }))
        }

        ws.onmessage = async (event) => {
            // JSON text frames = control messages
            if (typeof event.data === 'string') {
                let data
                try {
                    data = JSON.parse(event.data)
                } catch {
                    return
                }

                if (data.status === 'recording') {
                    const width = Number(data.width)
                    const maxLines = Number.isFinite(Number(data.maxLines)) ? Number(data.maxLines) : DEFAULT_MAX_LINES
                    if (!Number.isFinite(width) || width <= 0) return

                    if (!gpuRef.current.gpuReady ||
                        textureWidthRef.current !== width ||
                        maxLinesRef.current !== maxLines) {
                        onStatusChange?.('Initializing GPU...')
                        await initWebGPU(width, maxLines)
                    }
                }
                return
            }

            // Binary frames = raw grayscale pixel data
            if (!gpuRef.current.gpuReady) return

            const pixels = new Uint8Array(event.data)

            const writeRow = currentLineIndexRef.current % maxLinesRef.current
            gpuRef.current.device.queue.writeTexture(
                { texture: gpuRef.current.texture, origin: [0, writeRow, 0] },
                pixels,
                { bytesPerRow: textureWidthRef.current },
                [textureWidthRef.current, 1]
            )

            currentLineIndexRef.current += 1
            const headIndex = currentLineIndexRef.current % maxLinesRef.current
            updateUniforms(headIndex, currentLineIndexRef.current)

            const now = performance.now()
            if (lastFrequencyTimeRef.current === 0) {
                lastFrequencyTimeRef.current = now
                lastFrequencyLineCountRef.current = currentLineIndexRef.current
            } else if (now - lastFrequencyTimeRef.current >= 1000) {
                const elapsedSeconds = (now - lastFrequencyTimeRef.current) / 1000
                const linesDelta = currentLineIndexRef.current - lastFrequencyLineCountRef.current
                const freq = Math.round(linesDelta / elapsedSeconds)
                lastFrequencyTimeRef.current = now
                lastFrequencyLineCountRef.current = currentLineIndexRef.current
                onFrequencyChange?.(freq)
            }

            requestAnimationFrame(render)
        }

        ws.onclose = () => {
            onWsStatusChange?.(false)
            onFrequencyChange?.(0)
            wsRef.current = null
        }

        ws.onerror = () => {
            onWsStatusChange?.(false)
        }
    }, [initWebGPU, onFrequencyChange, onStatusChange, onWsStatusChange, render, updateUniforms, gpuRef, currentLineIndexRef, textureWidthRef, maxLinesRef])

    const stopStreaming = useCallback(() => {
        const ws = wsRef.current
        if (!ws) return

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'stop' }))
        }
        ws.close()
        wsRef.current = null
        onWsStatusChange?.(false)
        onFrequencyChange?.(0)
    }, [onFrequencyChange, onWsStatusChange])

    useEffect(() => {
        if (recording) {
            startStreaming()
            return () => stopStreaming()
        }

        stopStreaming()
        return undefined
    }, [recording, startStreaming, stopStreaming])
}
