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

struct RawMaterial 
{
    vec3 Albedo;
    float Metallic;
    float Roughness;
    float AO;
    float Emission;
};
struct Material 
{
    sampler2D Albedo;
    sampler2D Metallic;
    sampler2D Roughness;
    sampler2D AO;
};

out vec4 FragColor;

in vec3 model_pos;
in vec3 vNormal;
in vec2 vUV;

uniform Camera camera;
uniform Material material;
uniform RawMaterial rawMaterial; 
uniform bool IsUsingTextures;
uniform Light light1;

void main() {

    vec3 albedoMat;
    float metallicMat;
    float roughnessMat;
    float aoMat;
    float emissionMat;

    if(IsUsingTextures) 
    {
        albedoMat = texture(material.Albedo, vUV).rgb;
        metallicMat = texture(material.Metallic, vUV).r;
        roughnessMat = texture(material.Roughness, vUV).r;
        aoMat = texture(material.AO, vUV).r;
    } else 
    {
        albedoMat = rawMaterial.Albedo;
        metallicMat = rawMaterial.Metallic;
        roughnessMat = rawMaterial.Roughness;
        aoMat = rawMaterial.AO;
        emissionMat = rawMaterial.Emission;
    }

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

    vec3 result = (diffuseShading + specularShading) * albedoMat;

    result += emissionMat;

    FragColor = vec4(result, 1.0);
}