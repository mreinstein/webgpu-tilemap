struct TransformData {
	viewOffset: vec2<f32>,
	viewportSize: vec2<f32>,
	inverseAtlasTextureSize: vec2<f32>,
	tileSize: f32,
	inverseTileSize: f32,
	tileLayers: array<TileLayer, 32>,
};

// per tile layer data
struct TileLayer {
	scrollScale: vec2<f32>,
	inverseTileTextureSize: vec2<f32>
};


// individual tile texture
@binding(0) @group(0) var tileTexture: texture_2d<f32>;
@binding(1) @group(0) var tileSampler: sampler;

// common to all tile layers
@binding(0) @group(1) var<uniform> transformUBO: TransformData;
@binding(1) @group(1) var atlasTexture: texture_2d<f32>;
@binding(2) @group(1) var atlasSampler: sampler;


struct Fragment {
	@builtin(position) Position : vec4<f32>,
	@location(0) TexCoord : vec2<f32>,
	@location(1) PixelCoord : vec2<f32>
};


@vertex
fn vs_main (@builtin(instance_index) i_id : u32, 
	        @location(0) vertexPosition: vec2<f32>,
			@location(1) vertexTexCoord: vec2<f32>) -> Fragment  {

	var output : Fragment;

	var inverseTileTextureSize = 1 / vec2<f32>(textureDimensions(tileTexture, 0));  // transformUBO.tileLayers[i_id].inverseTileTextureSize;
	
	var scrollScale = transformUBO.tileLayers[i_id].scrollScale;

	var viewOffset : vec2<f32> = transformUBO.viewOffset * scrollScale;

	// from Brandon's webgl-tile shader
	output.PixelCoord = (vertexTexCoord * transformUBO.viewportSize) + viewOffset;                // vertex position in world space
	output.TexCoord = output.PixelCoord * inverseTileTextureSize * transformUBO.inverseTileSize;  // position in the tile texture for the vertex
  output.Position = vec4<f32>(vertexPosition, 0.0, 1.0);

	return output;
}


@fragment
fn fs_main (@location(0) TexCoord: vec2<f32>, @location(1) PixelCoord: vec2<f32>) -> @location(0) vec4<f32> {
	// from Brandon's webgl-tile shader
	var tile: vec4<f32> = textureSample(tileTexture, tileSampler, TexCoord);

	if (tile.x == 1.0 && tile.y == 1.0) {
		discard;
	}


	// add extruded tile space to the sprite offset. assumes 1 px extruded around each tile
  var extrudeOffset : vec2<f32>;
  let EXTRUDE_AMOUNT : f32 = 1.0;
  extrudeOffset[0] = floor(tile.x * 255.0) * (2*EXTRUDE_AMOUNT) + EXTRUDE_AMOUNT;
  extrudeOffset[1] = floor(tile.y * 255.0) * (2*EXTRUDE_AMOUNT) + EXTRUDE_AMOUNT;

	// top left corner of the sprite in the atlas for this particular tile type  (in pixel coords) 
  var spriteOffset : vec2<f32> = floor(tile.xy * 255.0) * transformUBO.tileSize + extrudeOffset;

  // position within the tile.   (0..15) for 16px wide tiles
	var spriteCoord : vec2<f32> = PixelCoord % transformUBO.tileSize;

	let inverseAtlasTextureSize = 1 / vec2<f32>(textureDimensions(atlasTexture, 0));

	return textureSample(atlasTexture, atlasSampler, (spriteOffset + spriteCoord) * inverseAtlasTextureSize);
}
