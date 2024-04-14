#version 300 es

in vec3 aPosition;
in vec3 aNormal;
in vec2 aUV;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() {
    gl_Position = projection * view * model * vec4(aPosition, 1.0);
}