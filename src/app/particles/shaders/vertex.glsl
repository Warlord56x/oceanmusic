uniform float uTime;
uniform float uSize;
uniform float uColorBlend;

// Music Uniforms
uniform float uBassFr;
uniform float uTreFr;
uniform float uMidFr;

varying float vDistance;


#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)


void main() {

  float distFactor = distance(position, vec3(0.0));
  float size = distFactor * uBassFr + uSize;
  vec3 particlePosition = position;

  float noiseStrength = uBassFr * uTreFr * 0.1 + 0.01;
  vec3 noiseOffset = vec3(
    snoise2(particlePosition.xy + uTime),
    snoise2(particlePosition.yz + uTime),
    snoise2(particlePosition.zx + uTime)
  ) * noiseStrength;

  vec3 jitterOffset = vec3(
    sin(particlePosition.x * uMidFr * 0.02 * uBassFr ),
    sin(particlePosition.y * uMidFr * 0.02 * uBassFr ),
    sin(particlePosition.z * uMidFr * 0.02 * uBassFr )
  );

  particlePosition += noiseOffset + jitterOffset;

  vDistance = distFactor;

  vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  gl_PointSize = size;
  gl_PointSize *= (1.0 / - viewPosition.z);
}
