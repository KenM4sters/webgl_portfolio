#version 300 es
precision highp float;

struct Camera 
{
    vec3 Position;
};

struct Light 
{
    vec3 Position;
    vec3 Color;
    float Intensity;
};

struct Material 
{
    vec3 Albedo;
    float Metallic;
    float Roughness;
    float AO;
};

out vec4 FragColor;

in vec3 model_pos;
in vec3 vNormal;

uniform Camera camera;
uniform Material material;
uniform Light light1;

void main() {

    vec3 P = model_pos;
    vec3 N = normalize(vNormal);
    vec3 lightDir = normalize(light1.Position - P);
    vec3 cameraDir = normalize(camera.Position - P);

    float lightAngle = max(dot(lightDir, N), 0.0);
    vec3 diffuseShading = lightAngle * light1.Color * light1.Intensity;

    float specularIntensity = 0.5;
    vec3 reflectedDir = reflect(-lightDir, N);
    float specular = pow(max(dot(reflectedDir, cameraDir), 0.0), 32.0);
    vec3 specularShading = specular * light1.Color * specularIntensity;

    vec3 result = (diffuseShading + specularShading) * material.Albedo;

    FragColor = vec4(result, 1.0);
}