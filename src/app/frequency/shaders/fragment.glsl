uniform sampler2D uTest;
uniform float uTime;

varying vec2 vUv;
varying float vAmplitude;

void main() {

  float barHeight = vAmplitude;

  float m = mix(0.0, 1.0, vAmplitude);

  vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), vAmplitude); // Blue to Red


  //vec3 color = vec3(noise, noise, noise);

  float mask = step(vUv.y, barHeight);

  gl_FragColor = vec4(color, mask * m);

}
