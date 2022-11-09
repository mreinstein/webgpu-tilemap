// all of the game's globals are consolidated here
export default {
    // webgpu
    renderer: undefined,

    world: undefined, // ECS instance

    // timekeeping (in milliseconds)
    lastFrameTime: 0, // local time the last frame ran
}
