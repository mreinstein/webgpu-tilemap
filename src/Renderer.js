import fetchShader            from './fetch-shader.js'
import { createTriangleMesh } from './triangle-mesh.js'
import { createMaterial }     from './material.js'


export async function createRenderer (canvas) {
    const adapter = await navigator.gpu?.requestAdapter()
    const device = await adapter?.requestDevice()
    const context = canvas.getContext('webgpu')
    const format = 'bgra8unorm'

    context.configure({
        device,
        format,
        alphaMode: 'opaque'
    })

    const triangleMesh = createTriangleMesh(device)

    const [ spritesMaterial, tilesMaterial, tilesMaterial2 ] = await Promise.all([
        createMaterial(device, 'assets/spelunky-tiles-extruded.png'),
        createMaterial(device, 'assets/spelunky0.png'),
        createMaterial(device, 'assets/spelunky1.png'),
    ])

    const shader = await fetchShader('/src/tile.wgsl')

    const uniformBuffer = device.createBuffer({
        size: 32 + (16 * 32), // in bytes.  32 for common data + (32 max tile layers * 16 bytes per tile layer)
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const spriteBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                texture:  { }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: { }
            }
        ],
    })

    const spriteBindGroup = device.createBindGroup({
        layout: spriteBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer
                }
            },
            {
                binding: 1,
                resource: spritesMaterial.view
            },
            {
                binding: 2,
                resource: spritesMaterial.sampler
            }
        ]
    })

    const tileBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture:  { }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: { }
            }
        ],
    })

    const tileBindGroup1 = device.createBindGroup({
        layout: tileBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: tilesMaterial.view
            },
            {
                binding: 1,
                resource: tilesMaterial.sampler
            }
        ]
    })

    const tileBindGroup2 = device.createBindGroup({
        layout: tileBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: tilesMaterial2.view
            },
            {
                binding: 1,
                resource: tilesMaterial2.sampler
            }
        ]
    })

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [ tileBindGroupLayout, spriteBindGroupLayout ]
    })

    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: shader
            }),
            entryPoint: 'vs_main',
            buffers: [ triangleMesh.bufferLayout ]
        },

        fragment: {
            module: device.createShaderModule({
                code: shader
            }),
            entryPoint: 'fs_main',
            targets: [
                {
                    format,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha',
                        },
                        alpha: {
                            srcFactor: 'zero',
                            dstFactor: 'one'
                        }
                    }
                }
            ]
        },

        primitive: {
            topology: 'triangle-list'
        },

        layout: pipelineLayout
    })

    return {
        canvas,

        // device/context objects
        adapter,
        device,
        context,
        format,

        // pipeline objects
        pipeline,
        uniformBuffer,
        spriteBindGroup,   // sprite texture, transform ubo
        tileBindGroup1,  // tile layer 1
        tileBindGroup2,  // tile layer 2  

        // assets
        triangleMesh,

        // used in the color attachments of renderpass
        clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
    }
}
