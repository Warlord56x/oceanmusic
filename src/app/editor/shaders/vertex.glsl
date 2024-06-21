uniform sampler2D uTextTexture;
uniform vec2 uTextTextureSize;
uniform float uTime;

varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  vUv = uv;

  // Sample the texture at the UV coordinates
  vec4 textureData = texture2D(uTextTexture, uv);

  vec3 newPosition = position;
  newPosition.z = textureData.r;

  vec3 noiseOffset = vec3(
    sin(snoise2(newPosition.xy) + uTime) * 0.1,
    sin(snoise2(newPosition.yz) + uTime) * 0.1,
    sin(snoise2(newPosition.zx) + uTime) * 0.1
  );

  newPosition += noiseOffset;

  // Calculate final position and size
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  float size = 10.0 * (10.0 + 10.0);
  gl_PointSize = 5.0;
  gl_PointSize *= (1.0 / - viewPosition.z);
}
