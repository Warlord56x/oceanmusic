uniform sampler2D uTexture;
uniform sampler2D uTouchTexture;
uniform float uTime;

varying vec2 vUv;

attribute float angle;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: PI = require(glsl-pi)

float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {

  vUv = uv;

  vec4 color = texture2D(uTexture, uv);

  float r = color.r;
  float g = color.g;
  float b = color.b;

  float intensity = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 5.0;

  vec3 particlePosition = position;

  float rand = random(length(particlePosition));
  vec3 noiseOffset = vec3(
  snoise2(particlePosition.xy + rand),
  snoise2(particlePosition.yz + rand),
  snoise2(particlePosition.zx + rand)
  );

  particlePosition += random(5.0) + noiseOffset;

  // touch
  float t = texture2D(uTouchTexture, uv).r;
  particlePosition.z += t * 100.0 * rand;

  particlePosition.x += cos(angle) * t * 100.0 * rand;
  particlePosition.y += sin(angle) * t * 100.0 * rand;

  // Calculate final position and size
  vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  float size = 5.0 * (1.0 + intensity + rand * 20.0);

  gl_PointSize = size;
  gl_PointSize *= (1.0 / - viewPosition.z);
}
