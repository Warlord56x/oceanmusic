uniform sampler2D uTexture;

varying vec3 vColor;
varying vec2 vUv;

void main() {

  gl_FragColor = texture2D(uTexture, vUv);

  #include <colorspace_fragment>
}
