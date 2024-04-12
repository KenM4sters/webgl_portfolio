import {gl} from "../App.ts";
import { Id } from "./Buffer.ts";



export enum ShaderDataType 
{
    None = 0, Float, Float2, Float3, Float4, Mat3f, Mat4f, Int, Int2, Int3, Int4, Bool, UCHAR
}

export class Shader 
{
    private ID : Id<WebGLProgram | null> = {val : null};
    private debugName : string = "";

    constructor(vScriptId : string, fScriptId : string, name : string) 
    {
        this.debugName = name;
        this.Compile(vScriptId, fScriptId);      
    }

    static Create(vScriptId : string, fScriptId : string, name : string) : Shader 
    {
        return new Shader(vScriptId, fScriptId, name);
    }
    

    // Getters 
    GetId() : Id<WebGLProgram | null> { return this.ID; }
    GetName() : string { return this.debugName; }
    // Setters
    SetName(name : string) { this.debugName = name; }

    private Compile(vScriptId : string, fScriptId : string) : void 
    {   
        // Firstly, we need to grab the actual source code of the script in string format.
        var vShaderSource : string | null | undefined = document.getElementById(vScriptId)?.textContent;
        var fShaderSource : string | null | undefined = document.getElementById(fScriptId)?.textContent;

        if(!vShaderSource || !fShaderSource)
            throw new Error("Failed to get Shader source code from scriptId!");

        // Secondly, we need to create glPrograms for each shader.
        var vShader = gl.createShader(gl.VERTEX_SHADER);
        if(vShader == null) throw new Error("Failed to create vertex shader!");
        gl.shaderSource(vShader, vShaderSource);
        gl.compileShader(vShader);
        // console.log(gl.getShaderInfoLog(vShader));

        var fShader = gl.createShader(gl.FRAGMENT_SHADER);
        if(fShader == null) throw new Error("Faield to create fragment shader!");
        gl.shaderSource(fShader, fShaderSource);
        gl.compileShader(fShader);
        // console.log(gl.getShaderInfoLog(fShader));


        // Thirdly, we need to link the 2 shaders into a single shader program that we can use/release
        // as and when we want to use the two shaders.
        this.ID = {val : gl.createProgram()};
        if(this.ID.val == null) throw new Error("Failed to create shader program!");
        gl.attachShader(this.ID.val, vShader);
        gl.attachShader(this.ID.val, fShader);
        gl.linkProgram(this.ID.val);
        if (!gl.getProgramParameter(this.ID.val, gl.LINK_STATUS)) {
            console.warn("Could not initialise shaders");
            console.log(gl.getProgramInfoLog(this.ID));
        }
        gl.useProgram(this.ID.val);        
    }
};

// Returns the size of a given shader type in bytes.
export function GetShaderDataType(type: ShaderDataType) : number 
{
    switch(type) 
    {
        case ShaderDataType.Float:      return 4;
        case ShaderDataType.Float2:     return 4 * 2;
        case ShaderDataType.Float3:     return 4 * 3;
        case ShaderDataType.Float4:     return 4 * 4;
        case ShaderDataType.Mat3f:      return 4 * 3 * 3;
        case ShaderDataType.Mat4f:      return 4 * 4 * 4;
        case ShaderDataType.Int:        return 4;
        case ShaderDataType.Int2:       return 4 * 2;
        case ShaderDataType.Int3:       return 4 * 3;
        case ShaderDataType.Int4:       return 4 * 4;
        case ShaderDataType.Bool:       return 1;
        case ShaderDataType.UCHAR:      return gl.UNSIGNED_BYTE;
    }
    console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
    return 0;
}

// Returns the number of elements of a given shader type.
export function GetShaderDataTypeCount(type: ShaderDataType) : number 
{
    switch(type) 
    {
        case ShaderDataType.Float:      return 1;
        case ShaderDataType.Float2:     return 2;
        case ShaderDataType.Float3:     return 3;
        case ShaderDataType.Float4:     return 4;
        case ShaderDataType.Mat3f:      return 3*3;
        case ShaderDataType.Mat4f:      return 4*4;
        case ShaderDataType.Int:        return 1;
        case ShaderDataType.Int2:       return 2;
        case ShaderDataType.Int3:       return 3;
        case ShaderDataType.Int4:       return 4;
        case ShaderDataType.Bool:       return 1;
    }
    console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
    return 0;
}

// Returns the WebGL type equivalent of our "ShaderDataType".
export function ConvertShaderTypeToNative(type: ShaderDataType) : number 
{
    switch(type) 
    {
        case ShaderDataType.Float:      return gl.FLOAT;
        case ShaderDataType.Float2:     return gl.FLOAT;
        case ShaderDataType.Float3:     return gl.FLOAT;
        case ShaderDataType.Float4:     return gl.FLOAT;
        case ShaderDataType.Mat3f:      return gl.FLOAT;
        case ShaderDataType.Mat4f:      return gl.FLOAT;
        case ShaderDataType.Int:        return gl.INT;
        case ShaderDataType.Int2:       return gl.INT;
        case ShaderDataType.Int3:       return gl.INT;
        case ShaderDataType.Int4:       return gl.INT;
        case ShaderDataType.Bool:       return gl.BOOL;
    }
    console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
    return 0;
}