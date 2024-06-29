uniform float uTime;
uniform sampler2D uTest;

varying vec2 vUv;
varying float vAmplitude;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

void main() {

  vUv = uv;

  float size = 50.0;
  vec3 particlePosition = position;

  int numBars = 10;
  float barWidth = 1.0 / float(numBars);
  int barIndex = int(uv.x * float(numBars));

  float sampleX = float(barIndex) * barWidth;
  float amplitude = texture2D(uTest, vec2(sampleX, 0.0)).r * 0.95;
  float barHeight = amplitude;

  float mask = step(vUv.y, barHeight);
  vAmplitude = amplitude;

  float noise = snoise2(vec2(amplitude * uv * uTime));

  particlePosition.z += barHeight * mask;
  particlePosition.y += noise;


  vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  gl_PointSize = size;
  gl_PointSize *= (1.0 / - viewPosition.z);
}
