import { Shader } from "./Renderer/Shader";
import * as glm from "gl-matrix";
import { Texture2D } from "./Renderer/Texture";
import VertexArray from "./Renderer/VertexArray";

export interface Transforms 
{
    Translation : glm.vec3;
    Scale : glm.vec3;
    Rotation : glm.quat;
    ModelMatrix : glm.mat4;
}

export function SetInitialTransforms() : Transforms
{
    return {        
        Translation: [0.0, 0.0, 0.0],
        Scale: [1.0, 1.0, 1.0],
        Rotation: [1.0, 1.0, 1.0, 1.0],
        ModelMatrix: glm.mat4.create()
    };
}

// Base class for indvidual material types that a scene object can associate with.
// Dervied materials can behave quite differently, so I've kept this base class very barebones
// with just the shader that will definitely be needed for any useful material.
export abstract class Material 
{
    constructor(s : Shader) 
    {
        this.shader = s;
    }

    // Simply Getter and Setter for the base Material class.
    GetShader() : Shader { return this.shader; }
    SetShader(s : Shader) : void { this.shader = s; }

    protected shader : Shader;
};

export class PBRMaterial extends Material 
{
    constructor(s : Shader) 
    {
        super(s);
    }   

    // These values can either be set manually or sampled from a texture (texture most likely).
    public Albedo     : glm.vec3 | Texture2D = [0.3, 0.1, 1.0]; 
    public Metallic   : number   | Texture2D = 0.3; 
    public Roughness  : number   | Texture2D = 0.8; 
    public AO         : number   | Texture2D = 0.2; 

};


export class Mesh 
{
    constructor(va : VertexArray) 
    {
        this.vertexArray = va;
    }

    // Getters
    GetVertexArray() : VertexArray { return this.vertexArray; }

    public transforms : Transforms = SetInitialTransforms();

    private vertexArray : VertexArray;
};