import Game from './Game.js'


export default function rendererSystem (world) {
    
    // tmp variables that are re-used to avoid allocating more memory each frame
    const buf = new Float32Array(8 + (4 * 32))


    const onUpdate = function (dt) {

        const renderer = Game.renderer

        const device = renderer.device
        const context = renderer.context
        const pipeline = renderer.pipeline
        const uniformBuffer = renderer.uniformBuffer
        const spriteBindGroup = renderer.spriteBindGroup
        const tileBindGroup1 = renderer.tileBindGroup1
        const tileBindGroup2 = renderer.tileBindGroup2
        const triangleMesh = renderer.triangleMesh

        const elapsed = performance.now()
        
        const x = (Math.sin(elapsed / 2000) * 0.5 + 0.5) * 128
        const y = (Math.sin(elapsed / 5000) * 0.5 + 0.5) * 170

        const tileScale = 2.30664545 //4.30664545

        const tileSize = 16.0

        // viewOffset.  [0, 0] is the top left corner of the level
        buf[0] = Math.floor(x * tileScale)  // viewoffset[0] 
        buf[1] = Math.floor(y * tileScale) // viewOffset[1]


        // TODO: everything after buf[1] doesn't need to be updated every frame

        buf[2] = 800 / tileScale            // viewportSize[0]
        buf[3] = 600 / tileScale            // viewportSize[1]
    
        // 144 is with 1 px extruded
        
        buf[4] = 1/144                      // inverseAtlasTextureSize[0]
        buf[5] = 1/144                      // inverseAtlasTextureSize[1]
        buf[6] = tileSize
        buf[7] = 1.0 / tileSize             // inverseTileSize

        // tile layer 1 instance data
        buf[8] = 0.6                        // scrollScale[0]
        buf[9] = 0.6                        // scrollScale[1]
        buf[10] = 1/2                       // inverseTileTextureSize[0]
        buf[11] = 1/2                       // inverseTileTextureSize[1]

        // tile layer 2 instance data
        buf[12] = 1.0                        // scrollScale[0]
        buf[13] = 1.0                        // scrollScale[1]
        buf[14] = 1/42                       // inverseTileTextureSize[0]
        buf[15] = 1/34                       // inverseTileTextureSize[1]
        
        device.queue.writeBuffer(uniformBuffer, 0, buf, 0, 16)
        

        const commandEncoder = device.createCommandEncoder()
        const textureView = context.getCurrentTexture().createView()

        const renderpass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: renderer.clearValue,
                    loadOp: 'clear',
                    storeOp: 'store'
                }
            ]
        })

        renderpass.setPipeline(pipeline)
        renderpass.setVertexBuffer(0, triangleMesh.buffer)

        // common stuff; the transform data and the sprite texture
        renderpass.setBindGroup(1, spriteBindGroup)

        // tile layer 1
        renderpass.setBindGroup(0, tileBindGroup2)
        // vertexCount, instanceCount, baseVertexIdx, baseInstanceIdx
        renderpass.draw(6, 1, 0, 0)

        
        // tile layer 2
        renderpass.setBindGroup(0, tileBindGroup1)
        // vertexCount, instanceCount, baseVertexIdx, baseInstanceIdx
        renderpass.draw(6, 1, 0, 1)
        

        renderpass.end()

        device.queue.submit([ commandEncoder.finish() ])
    }

    return { onUpdate }
}
