
varying vec3 vColor;
varying vec2 vUv;

void main() {

  gl_FragColor = vec4(vColor.rgb, 1.0);

  #include <colorspace_fragment>
}
