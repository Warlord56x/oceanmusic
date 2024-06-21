uniform sampler2D uTexture;
uniform sampler2D uGradient;

varying vec3 vColor;
varying vec2 vUv;

void main() {

  gl_FragColor = texture2D(uTexture, vUv) *texture2D(uGradient, vUv).r;

  #include <colorspace_fragment>
}
