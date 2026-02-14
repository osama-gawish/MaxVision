export const DEFAULT_MAX_LINES = 2048
export const ZOOM_FACTOR = 1.1
export const MAX_ZOOM = 20.0
export const MIN_ZOOM = 1.0

export const shaderCode = `
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
        let gray = textureSample(myTexture, mySampler, adjustedUV).r;
        return vec4<f32>(gray, gray, gray, 1.0);
    }
`
