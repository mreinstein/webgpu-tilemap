import Game from './Game.js'


export default function rendererSystem (world) {
    
    const onUpdate = function (dt) {

        const renderer = Game.renderer

        const device = renderer.device
        const context = renderer.context
        const pipeline = renderer.pipeline
        const uniformBuffer = renderer.uniformBuffer
        const bindGroup = renderer.bindGroup
        const bindGroup2 = renderer.bindGroup2
        const triangleMesh = renderer.triangleMesh

        const elapsed = performance.now()
        const x = (Math.sin(elapsed / 2000) * 0.5 + 0.5) * 128
        const y = (Math.sin(elapsed / 5000) * 0.5 + 0.5) * 170

        const tileScale = 2.0

        //const layer = { scrollScaleX: 0.6, scrollScaleY: 0.6 }

        const viewOffset = [ Math.floor(x * tileScale /** layer.scrollScaleX*/), Math.floor(y * tileScale /* * layer.scrollScaleY*/ ) ]
        const viewportSize = [ 800 / tileScale, 600 / tileScale ]
        const inverseTileTextureSize = [ 1/42, 1/34 ]
        const inverseSpriteTextureSize = [ 1/128, 1/128 ]

        const tileSize = 16.0
        const inverseTileSize = 1.0 / tileSize

        const arr = new Float32Array([ viewOffset[0], viewOffset[1], viewportSize[0], viewportSize[1], inverseTileTextureSize[0], inverseTileTextureSize[1], inverseSpriteTextureSize[0], inverseSpriteTextureSize[1], tileSize, inverseTileSize ])
    
        device.queue.writeBuffer(uniformBuffer, 0, arr, 0, 10)

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


        // draw layer 1
        renderpass.setBindGroup(0, bindGroup2)
        // vertexCount, instanceCount, baseVertexIdx, baseInstanceIdx
        renderpass.draw(6, 1, 0, 0)


        // draw layer 2
        renderpass.setBindGroup(0, bindGroup)
        // vertexCount, instanceCount, baseVertexIdx, baseInstanceIdx
        renderpass.draw(6, 1, 0, 1)


        renderpass.end()

        device.queue.submit([ commandEncoder.finish() ])
    }

    return { onUpdate }
}
