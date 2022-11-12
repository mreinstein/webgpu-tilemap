# webgpu-tilemap
a semi-faithful port/update of Brandon's fantastic webgl tilemap proof of concept


For now you'll need chrome canary with the unsafe webgpu flags enabled. 

You can see this running at https://webgpu-tilemap.vercel.app/


## todo
* move `scrollScale` to instance data
* move `inverseSpriteTextureSize` to instance data
* rename `bindGroup`, `bindGroup1`, and `bindGroup1` terrible, just terrible. Maybe `spriteBindGroup`, `tileBindGroup1`, `tileBindGroup2` ?


## references

* original blog post https://blog.tojicode.com/2012/07/sprite-tile-maps-on-gpu.html
