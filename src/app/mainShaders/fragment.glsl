
varying vec3 vColor;
varying vec2 vUv;

void main() {

  vec4 color = vec4(vColor.rgb, 1.0);
  vec2 uv = vUv;

  // greyscale
  float grey = color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
  vec4 colB = vec4(grey, grey, grey, 1.0);

  // circle
  float border = 0.3;
  float radius = 0.5;
  float dist = radius - distance(uv, vec2(0.5));
  float t = smoothstep(0.0, border, dist);

  // final color
  color = colB;
  color.a = t;

  gl_FragColor = color;

  #include <colorspace_fragment>
}
