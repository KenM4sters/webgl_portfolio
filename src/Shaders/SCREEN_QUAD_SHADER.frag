#version 300 es
precision highp float;


out vec4 FragColor;
in vec2 vUV;

uniform sampler2D tex;
uniform vec3 Color;


void main() {

    vec3 color = texture(tex, vUV).rgb;
    // FragColor = vec4(1.0 - color.x, 1.0 - color.y, 1.0 - color.z, 1.0);
    FragColor = vec4(color, 1.0);
}