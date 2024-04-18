#version 300 es

in vec3 aPosition;
in vec3 aColor;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() 
{
    vec4 clipPos = projection * view * model * vec4(aPosition, 1.0);
    gl_Position = clipPos;
    gl_PointSize = 100.0 / length(clipPos.xyz);
}