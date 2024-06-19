// shaders/vertex.glsl
precision mediump float;

varying vec3 vpos;
attribute float size;
attribute float speed;
attribute float opacity;
attribute vec3 noise;
attribute vec3 color;

void main() {
    vpos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( vpos * size, 1.0 );
}
