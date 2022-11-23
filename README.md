# webgpu-tilemap
a semi-faithful port/update of Brandon's fantastic webgl tilemap proof of concept


For now you'll need chrome canary with the unsafe webgpu flags enabled. 

You can see this running at https://webgpu-tilemap.vercel.app/


## todo
* handle browser window resizes


# creating extruded texture files

extruded tiles makes it possible to do linear filtering, which eliminates "texture bleed".  Here is an example command that takes a non-extruded
texture file and produces an extruded by 1 px version:

```bash
npx tile-extruder --tileWidth 16 --tileHeight 16 --extrusion 1 --input ./assets/spelunky-tiles.png --output assets/spelunky-tiles-extruded.png
```


## references

* original blog post https://blog.tojicode.com/2012/07/sprite-tile-maps-on-gpu.html
