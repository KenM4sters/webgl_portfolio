import {gl} from "../main.ts";
import { RenderCommand } from "./RenderCommand.ts";

class Shader 
{
    private ID : WebGLProgram | null = 0;
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
    
    public SetInt(name : string, val : number) : void 
    {
        if(this.ID)
            RenderCommand.UseShader(this.ID);
    }

    // Getters 
    GetId() : WebGLProgram | null { return this.ID; }
    GetName() : string { return this.debugName; }
    // Setters
    SetName(name : string) { this.debugName = name; }

    private Compile(vScriptId : string, fScriptId : string) : void 
    {   
        // Firstly, we need to grab the actual source code of the script in string format.
        var vShaderSource = document.getElementById(vScriptId)?.textContent as string;
        var fShaderSource = document.getElementById(fScriptId)?.textContent as string;

        // Secondly, we need to create glPrograms for each shader.
        var vShader = gl.createShader(gl.VERTEX_SHADER);
        if(vShader == null) throw new Error("Failed to create vertex shader!");
        gl.shaderSource(vShader, vShaderSource);
        gl.compileShader(vShader);

        var fShader = gl.createShader(gl.FRAGMENT_SHADER);
        if(fShader == null) throw new Error("Faield to create fragment shader!");
        gl.shaderSource(fShader, fShaderSource);
        gl.compileShader(fShader);

        // Thirdly, we need to link the 2 shaders into a single shader program that we can use/release
        // as and when we want to use the two shaders.
        this.ID = gl.createProgram();
        if(this.ID == null) throw new Error("Failed to create shader program!");
        gl.attachShader(this.ID, vShader);
        gl.attachShader(this.ID, fShader);
        gl.linkProgram(this.ID);
        if (!gl.getProgramParameter(this.ID, gl.LINK_STATUS)) {
            console.warn("Could not initialise shaders");
        }
        gl.useProgram(this.ID);        
    }
};