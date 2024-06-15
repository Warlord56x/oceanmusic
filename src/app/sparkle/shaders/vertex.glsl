// shaders/vertex.glsl
attribute float size;
attribute float speed;
attribute float opacity;
attribute vec3 noise;
attribute vec3 color;
uniform float time;
varying vec3 vColor;
varying float vOpacity;

void main() {
  vColor = color;
  vOpacity = opacity;

  // Calculate individual particle position based on noise and speed
  vec3 pos = position + noise * sin(time * speed);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * (300.0 / -mvPosition.z);
}
