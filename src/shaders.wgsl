struct TransformData {
	viewOffset: vec2<f32>,
	viewportSize: vec2<f32>,
	inverseTileTextureSize: vec2<f32>,
	inverseSpriteTextureSize: vec2<f32>,
	tileSize: f32,
	inverseTileSize: f32
};

@binding(0) @group(0) var<uniform> transformUBO: TransformData;
@binding(1) @group(0) var spriteTexture: texture_2d<f32>;
@binding(2) @group(0) var spriteSampler: sampler;
@binding(3) @group(0) var tileTexture: texture_2d<f32>;
@binding(4) @group(0) var tileSampler: sampler;


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

	var viewOffset : vec2<f32>;

	if (i_id == 0) {
		viewOffset = transformUBO.viewOffset * vec2<f32>(0.6, 0.6);
	} else {
		viewOffset = transformUBO.viewOffset * vec2<f32>(1.0, 1.0);
	}

	// from Brandon's webgl-tile shader
	output.PixelCoord = (vertexTexCoord * transformUBO.viewportSize) + viewOffset;
	//output.PixelCoord = (vertexTexCoord * transformUBO.viewportSize) + transformUBO.viewOffset;
	output.TexCoord = output.PixelCoord * transformUBO.inverseTileTextureSize * transformUBO.inverseTileSize;
    output.Position = vec4<f32>(vertexPosition, 0.0, 1.0);

	return output;
}


@fragment
fn fs_main (@location(0) TexCoord: vec2<f32>, @location(1) PixelCoord: vec2<f32>) -> @location(0) vec4<f32> {
	// from Brandon's webgl-tile shader
	var tile: vec4<f32> = textureSample(tileTexture, tileSampler, TexCoord);

	// TODO: this throws a console warning, "control flow depends on non-uniform value"
	// I assume this is just letting us know that branching based on some frequently changing value
	// might be a serious performance pit?s
	if (tile.x == 1.0 && tile.y == 1.0) {
		discard;
	}

    var spriteOffset : vec2<f32> = floor(tile.xy * 256.0) * transformUBO.tileSize;
	var spriteCoord : vec2<f32> = PixelCoord % transformUBO.tileSize;
	return textureSample(spriteTexture, spriteSampler, (spriteOffset + spriteCoord) * transformUBO.inverseSpriteTextureSize);
}
