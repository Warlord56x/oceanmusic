uniform sampler2D uTextTexture;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(uTextTexture, vUv);

  gl_FragColor = color;

  #include <colorspace_fragment>
}
