uniform vec3 uColorFrom;
uniform vec3 uColorTo;

uniform float uColorBlend;

varying float vDistance;

void main() {
  vec3 color = uColorFrom;

  color = mix(uColorFrom, uColorTo, mix(0.0, vDistance, uColorBlend));
  gl_FragColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}
