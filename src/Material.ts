import * as glm from "gl-matrix";
import { Shader } from "./Renderer/Shader";
import { Texture2D } from "./Renderer/Texture";

export interface MatProp 
{
    val : number | glm.vec3;
    tex : Texture2D;
};

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
    public emission : {val: number} = {val: 0};
    public isUsingTextures : {val: boolean} = {val: false};
};

export class PhysicalMaterial extends Material 
{
    constructor(s : Shader) 
    {
        super(s);
    }   

    // These values can either be set manually or sampled from a texture (texture most likely, but they'll be numbers by default).
    public Albedo     : MatProp = {val: glm.vec3.fromValues(0.3, 0.1, 1.0), tex: Texture2D.CreateDefault()}; 
    public Metallic   : MatProp = {val: 0.3, tex: Texture2D.CreateDefault()}; 
    public Roughness  : MatProp = {val: 0.8, tex: Texture2D.CreateDefault()}; 
    public AO         : MatProp = {val: 0.2, tex: Texture2D.CreateDefault()}; 
};


// This is literally just a shader (for now at least), but I wanted to keep the same convention of tying shaders
// with materials.
export class RenderPassMaterial extends Material
{
    constructor(s : Shader) 
    {
        super(s);
    }
};