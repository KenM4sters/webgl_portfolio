import {gl} from "../main.ts";
import * as glm from "gl-matrix";
import { VertexBuffer, IndexBuffer } from "./Buffer.ts";

export enum BufferType 
{
    Vertex,
    Index
};

export enum TextureType 
{
    Tex2D = gl.TEXTURE_2D,
    CubeTex = gl.TEXTURE_CUBE_MAP
}

export enum ImageChannels 
{
    RGB = gl.RGB,
    RGBA = gl.RGBA
}

export interface ImageConfig {
    TargetType : TextureType;
    MipMapLevel : number;
    NChannels : ImageChannels;
    Width : number;
    Height : number;
    Format : number;
    DataType : number;
};


// This class is entirely responsible for connecting our application to the WebGL API. 
// Every single call made to WebGL can be found here, which is why I like to create this 
// layer of abstraction that seperates our application from the actual WebGL API. 
// It's essentially our own tiny custom graphics API.
export class RenderCommand 
{
    constructor() {}

    // Create Buffer
    static CreateVertexBuffer(vertices : Float32Array) : VertexBuffer 
    {
        return new VertexBuffer(vertices)
    }
    static CreateIndexBuffer(indices : Uint16Array) : IndexBuffer 
    {
        return new IndexBuffer(indices)
    }

    // Bind Buffer
    static CreateBuffer() : WebGLBuffer 
    {
        const Id = gl.createBuffer();
        if(!Id) throw new Error("RenderCommand | Failed to create buffer!");
        return Id;
    }

    static BindBuffer(Id : WebGLBuffer, type : BufferType) : void { 
        type == BufferType.Vertex ? gl.bindBuffer(gl.ARRAY_BUFFER, Id) 
            : gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Id);
    }

    static UnbindBuffer(type : BufferType) {
        type == BufferType.Vertex ? gl.bindBuffer(gl.ARRAY_BUFFER, 0) 
            : gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, 0);
    }

    // Set Buffer Data
    static SetVertexBufferData(Id : WebGLBuffer, cachedVertices : Float32Array) : void 
    {
        gl.bufferData(gl.ARRAY_BUFFER, cachedVertices, gl.STATIC_DRAW);
    }

    static SetIndexBufferData(indices : Uint16Array) : void 
    {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    // Vertex Array - skipping for now since I'm thinking about storing all vertices in a single 
    // buffer, which would slightly complicate how we set the offsets and stride of data.
    static EnableVertexArray(shaderProgram : WebGLProgram, name : string) : void 
    {
        gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, name));
    }
    
    static SetVertexArrayAttribute(data : Float32Array, size: number, position : number) : void 
    {
        gl.vertexAttribPointer(position, size, gl.FLOAT, false, 0, 0);
    }

    // Shaders
    static CreateShader() : WebGLProgram
    {
        const temp : WebGLProgram | null = gl.createProgram();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create shader program!");
    }
    static UseShader(Id : WebGLProgram) : void { gl.useProgram(Id); }
    static ReleaseShader() : void { gl.useProgram(0); }

    static SetInt(Id : WebGLProgram, name : string, val : number) : void 
    {
        gl.uniform1i(gl.getUniformLocation(Id, name), val);
    }

    static SetFloat(Id : WebGLProgram, name : string, val : number) : void 
    {
        gl.uniform1f(gl.getUniformLocation(Id, name), val);
    }

    static SetVec3f(Id : WebGLProgram, name : string, val : glm.vec3) : void 
    {
        gl.uniform3f(gl.getUniformLocation(Id, name), val[0], val[1], val[2]);
    }

    static SetVec4f(Id : WebGLProgram, name : string, val : glm.vec4) : void 
    {
        gl.uniform4f(gl.getUniformLocation(Id, name), val[0], val[1], val[2], val[3]);
    }

    static SetMat3f(Id : WebGLProgram, name : string, val : glm.mat3) : void 
    {
        gl.uniformMatrix3fv(gl.getUniformLocation(Id, name), false, val);
    }

    static SetMat4f(Id : WebGLProgram, name : string, val : glm.mat4) : void 
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(Id, name), false, val);
    }

    // Textures
    static CreateTexture() : WebGLTexture 
    {
        const temp : WebGLTexture | null = gl.createTexture();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create texture!");
    }
    static BindTexture(Id : WebGLTexture, type : TextureType, texUnit : number = 0) : void 
    {
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(type, Id);
    }
    static UnBindTexture(type : TextureType, texUnit : number = 0) : void 
    {
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(type, 0);
    }
    static SetTexture2DArray(config : ImageConfig, data : Uint8Array | null) : void 
    {
        gl.texImage2D(gl.TEXTURE_2D, config.MipMapLevel, config.NChannels, config.Width, config.Height, 0, config.Format, config.DataType, data);
    }  
    static SetTexture2DImage(config : ImageConfig, data : HTMLImageElement) : void 
    {
        gl.texImage2D(gl.TEXTURE_2D, config.MipMapLevel, config.NChannels, config.Format, config.DataType, data);
    }
    static GenerateMipMap(type : TextureType) : void 
    {
        gl.generateMipmap(type);
    }

    // Framebuffers
    static CreateFramebuffer() : WebGLFramebuffer  
    {
        const temp : WebGLFramebuffer | null = gl.createFramebuffer();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create framebuffer!");
    }
    static BindFramebuffer(Id : WebGLFramebuffer) : void
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, Id);
    }
    static UnbindFramebuffer() : void
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, 0);
    }
    static SetFramebufferColorAttachment(targetTexture : WebGLTexture, unit : number = 0) : void
    {
        const attachmentUnit = gl.COLOR_ATTACHMENT0 + unit;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentUnit, gl.TEXTURE_2D, targetTexture, 0);
    }

    // Renderbuffers
    static CreateRenderbuffer() : WebGLRenderbuffer 
    {
        const temp : WebGLRenderbuffer | null = gl.createRenderbuffer();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create renderbuffer!");
    }
    static BindRenderbuffer(Id : WebGLRenderbuffer) : void 
    {
        gl.bindRenderbuffer(gl.RENDERBUFFER, Id);
    }
    static SetRenderbufferDepthAttachment(RBO : WebGLRenderbuffer, FBO: WebGLFramebuffer, config : ImageConfig) : void 
    {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, config.Width, config.Height);
        this.BindFramebuffer(FBO);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, RBO);
        this.UnbindFramebuffer();
    }
    static UnbindRenderbuffer() : void 
    {
        gl.bindRenderbuffer(gl.RENDERBUFFER, 0);
    } 

};