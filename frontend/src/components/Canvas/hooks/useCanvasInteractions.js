import { useEffect, useRef } from 'react'
import { ZOOM_FACTOR, MAX_ZOOM, MIN_ZOOM } from '../shaders/lineScanShader'

export default function useCanvasInteractions({
    canvasRef,
    zoomScaleRef,
    panOffsetXRef,
    panOffsetYRef,
    currentLineIndexRef,
    maxLinesRef,
    updateUniforms,
    render,
}) {
    const isDraggingRef = useRef(false)
    const lastMouseXRef = useRef(0)
    const lastMouseYRef = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return undefined

        const handleWheel = (event) => {
            event.preventDefault()

            const rect = canvas.getBoundingClientRect()
            const mouseX = event.clientX - rect.left
            const mouseY = event.clientY - rect.top

            const clipX = (mouseX / rect.width) * 2 - 1
            const clipY = -((mouseY / rect.height) * 2 - 1)

            const worldX = (clipX - panOffsetXRef.current) / zoomScaleRef.current
            const worldY = (clipY - panOffsetYRef.current) / zoomScaleRef.current

            if (event.deltaY < 0) {
                zoomScaleRef.current = Math.min(zoomScaleRef.current * ZOOM_FACTOR, MAX_ZOOM)
            } else {
                zoomScaleRef.current = Math.max(zoomScaleRef.current / ZOOM_FACTOR, MIN_ZOOM)
            }

            panOffsetXRef.current = clipX - worldX * zoomScaleRef.current
            panOffsetYRef.current = clipY - worldY * zoomScaleRef.current

            updateUniforms(
                currentLineIndexRef.current % maxLinesRef.current,
                currentLineIndexRef.current
            )
            requestAnimationFrame(render)
        }

        const handleMouseDown = (event) => {
            isDraggingRef.current = true
            lastMouseXRef.current = event.clientX
            lastMouseYRef.current = event.clientY
            canvas.style.cursor = 'grabbing'
        }

        const handleMouseMove = (event) => {
            if (!isDraggingRef.current) return

            const dx = event.clientX - lastMouseXRef.current
            const dy = event.clientY - lastMouseYRef.current
            lastMouseXRef.current = event.clientX
            lastMouseYRef.current = event.clientY

            const rect = canvas.getBoundingClientRect()
            panOffsetXRef.current += (dx / rect.width) * 2
            panOffsetYRef.current -= (dy / rect.height) * 2

            updateUniforms(
                currentLineIndexRef.current % maxLinesRef.current,
                currentLineIndexRef.current
            )
            requestAnimationFrame(render)
        }

        const handleMouseUp = () => {
            isDraggingRef.current = false
            canvas.style.cursor = 'grab'
        }

        const handleMouseLeave = () => {
            isDraggingRef.current = false
            canvas.style.cursor = 'grab'
        }

        const handleDoubleClick = () => {
            zoomScaleRef.current = 1.0
            panOffsetXRef.current = 0.0
            panOffsetYRef.current = 0.0
            updateUniforms(
                currentLineIndexRef.current % maxLinesRef.current,
                currentLineIndexRef.current
            )
            requestAnimationFrame(render)
        }

        canvas.addEventListener('wheel', handleWheel, { passive: false })
        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseup', handleMouseUp)
        canvas.addEventListener('mouseleave', handleMouseLeave)
        canvas.addEventListener('dblclick', handleDoubleClick)

        return () => {
            canvas.removeEventListener('wheel', handleWheel)
            canvas.removeEventListener('mousedown', handleMouseDown)
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('mouseup', handleMouseUp)
            canvas.removeEventListener('mouseleave', handleMouseLeave)
            canvas.removeEventListener('dblclick', handleDoubleClick)
        }
    }, [canvasRef, zoomScaleRef, panOffsetXRef, panOffsetYRef, currentLineIndexRef, maxLinesRef, render, updateUniforms])
}
