import { useCallback, useRef } from 'react'
import { shaderCode, DEFAULT_MAX_LINES } from '../shaders/lineScanShader'

export default function useWebGPU(canvasRef, onStatusChange) {
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

    const zoomScaleRef = useRef(1.0)
    const panOffsetXRef = useRef(0.0)
    const panOffsetYRef = useRef(0.0)

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
            format: 'r8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
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
    }, [canvasRef, onStatusChange, render, updateUniforms])

    return {
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
    }
}
