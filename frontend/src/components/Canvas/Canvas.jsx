import { useCallback, useEffect, useRef } from 'react'
import styles from './Canvas.module.css'

const DEFAULT_MAX_LINES = 2048
const ZOOM_FACTOR = 1.1
const MAX_ZOOM = 10.0
const MIN_ZOOM = 1.0

const shaderCode = `
    struct Uniforms {
        headIndex: f32,
        textureHeight: f32,
        lineCount: f32,
        scale: f32,
        offsetX: f32,
        offsetY: f32,
        _padding1: f32,
        _padding2: f32,
    };

    @group(0) @binding(0) var<uniform> uniforms: Uniforms;
    @group(0) @binding(1) var mySampler: sampler;
    @group(0) @binding(2) var myTexture: texture_2d<f32>;

    struct VertexOutput {
        @builtin(position) Position: vec4<f32>,
        @location(0) uv: vec2<f32>,
    };

    @vertex
    fn vs_main(@builtin(vertex_index) VertexIndex: u32) -> VertexOutput {
        var pos = array<vec2<f32>, 4>(
            vec2<f32>(-1.0, -1.0),
            vec2<f32>( 1.0, -1.0),
            vec2<f32>(-1.0,  1.0),
            vec2<f32>( 1.0,  1.0)
        );

        var uvs = array<vec2<f32>, 4>(
            vec2<f32>(0.0, 1.0),
            vec2<f32>(1.0, 1.0),
            vec2<f32>(0.0, 0.0),
            vec2<f32>(1.0, 0.0)
        );

        var output: VertexOutput;
        var scaledPos = pos[VertexIndex] * uniforms.scale;
        scaledPos.x = scaledPos.x + uniforms.offsetX;
        scaledPos.y = scaledPos.y + uniforms.offsetY;
        output.Position = vec4<f32>(scaledPos, 0.0, 1.0);
        output.uv = uvs[VertexIndex];
        return output;
    }

    @fragment
    fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
        let h = uniforms.textureHeight;
        let head = uniforms.headIndex;

        var textureY = (head / h) + uv.y;
        if (textureY >= 1.0) {
            textureY = textureY - 1.0;
        }

        let adjustedUV = vec2<f32>(uv.x, textureY);
        return textureSample(myTexture, mySampler, adjustedUV);
    }
`;

function Canvas({ recording, onStatusChange, onWsStatusChange, onFrequencyChange }) {
    const canvasRef = useRef(null)
    const wsRef = useRef(null)

    const gpuRef = useRef({
        device: null,
        context: null,
        pipeline: null,
        texture: null,
        sampler: null,
        uniformBuffer: null,
        bindGroup: null,
        gpuReady: false,
    })

    const textureWidthRef = useRef(0)
    const maxLinesRef = useRef(DEFAULT_MAX_LINES)
    const currentLineIndexRef = useRef(0)
    const lastFrequencyTimeRef = useRef(0)
    const lastFrequencyLineCountRef = useRef(0)

    const zoomScaleRef = useRef(1.0)
    const panOffsetXRef = useRef(0.0)
    const panOffsetYRef = useRef(0.0)
    const isDraggingRef = useRef(false)
    const lastMouseXRef = useRef(0)
    const lastMouseYRef = useRef(0)

    const updateUniforms = useCallback((headIndex, lineCount) => {
        const { device, uniformBuffer, gpuReady } = gpuRef.current
        if (!device || !uniformBuffer || !gpuReady) return

        const data = new Float32Array([
            headIndex,
            maxLinesRef.current,
            lineCount,
            zoomScaleRef.current,
            panOffsetXRef.current,
            panOffsetYRef.current,
            0,
            0,
        ])
        device.queue.writeBuffer(uniformBuffer, 0, data)
    }, [])

    const render = useCallback(() => {
        const { device, context, pipeline, bindGroup, gpuReady } = gpuRef.current
        if (!device || !context || !pipeline || !bindGroup || !gpuReady) return

        const commandEncoder = device.createCommandEncoder()
        const textureView = context.getCurrentTexture().createView()

        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }]
        })

        passEncoder.setPipeline(pipeline)
        passEncoder.setBindGroup(0, bindGroup)
        passEncoder.draw(4)
        passEncoder.end()

        device.queue.submit([commandEncoder.finish()])
    }, [])

    const initWebGPU = useCallback(async (width, maxLines) => {
        if (!navigator.gpu) {
            onStatusChange?.('WebGPU not supported')
            return false
        }

        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) {
            onStatusChange?.('No GPU adapter found')
            return false
        }

        const device = await adapter.requestDevice()
        const canvas = canvasRef.current
        if (!canvas) return false

        const context = canvas.getContext('webgpu')
        if (!context) {
            onStatusChange?.('WebGPU context not available')
            return false
        }

        maxLinesRef.current = maxLines || DEFAULT_MAX_LINES
        textureWidthRef.current = width
        canvas.width = textureWidthRef.current
        canvas.height = maxLinesRef.current

        const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
        context.configure({
            device,
            format: canvasFormat,
            alphaMode: 'premultiplied',
        })

        const shaderModule = device.createShaderModule({ code: shaderCode })

        const uniformBuffer = device.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} }
            ]
        })

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        })

        const pipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: { module: shaderModule, entryPoint: 'vs_main' },
            fragment: { module: shaderModule, entryPoint: 'fs_main', targets: [{ format: canvasFormat }] },
            primitive: { topology: 'triangle-strip' }
        })

        const texture = device.createTexture({
            size: [textureWidthRef.current, maxLinesRef.current],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        })

        const sampler = device.createSampler({
            magFilter: 'nearest',
            minFilter: 'nearest',
        })

        const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: uniformBuffer } },
                { binding: 1, resource: sampler },
                { binding: 2, resource: texture.createView() }
            ]
        })

        gpuRef.current = {
            device,
            context,
            pipeline,
            texture,
            sampler,
            uniformBuffer,
            bindGroup,
            gpuReady: true,
        }

        updateUniforms(currentLineIndexRef.current % maxLinesRef.current, currentLineIndexRef.current)
        render()
        onStatusChange?.('WebGPU Ready')
        return true
    }, [onStatusChange, render, updateUniforms])

    const startStreaming = useCallback(() => {
        if (wsRef.current) return

        const wsUrl = `ws://${window.location.host}/ws/stream`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            onWsStatusChange?.(true)
            onFrequencyChange?.(0)
            ws.send(JSON.stringify({ action: 'start' }))
        }

        ws.onmessage = async (event) => {
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
                return
            }

            if (data.type !== 'line' || !data.data) return
            if (!gpuRef.current.gpuReady) return

            const response = await fetch(`data:image/png;base64,${data.data}`)
            const blob = await response.blob()
            const imgBitmap = await createImageBitmap(blob)

            const writeRow = currentLineIndexRef.current % maxLinesRef.current
            gpuRef.current.device.queue.copyExternalImageToTexture(
                { source: imgBitmap },
                { texture: gpuRef.current.texture, origin: [0, writeRow, 0] },
                [imgBitmap.width, 1]
            )

            if (typeof imgBitmap.close === 'function') {
                imgBitmap.close()
            }

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
    }, [initWebGPU, onFrequencyChange, onStatusChange, onWsStatusChange, render, updateUniforms])

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
    }, [render, updateUniforms])

    return (
        <div className={styles.canvasContainer}>
            <canvas ref={canvasRef} className={styles.canvas} />
        </div>
    )
}

export default Canvas
