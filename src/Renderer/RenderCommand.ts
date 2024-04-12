import {gl} from "../App.ts";
import * as glm from "gl-matrix";
import { VertexBuffer, IndexBuffer } from "./Buffer.ts";
import { TextureType, ImageConfig, ImageChannels, ConvertTextureTypeToNative, ConvertImageChannelsToNative } from "./Texture.ts";
import { ConvertBitsToNative, FramebufferBits } from "../RenderLayer.ts";

export enum BufferType 
{
    Vertex,
    Index
};


// This class is entirely responsible for connecting our application to the WebGL API. 
// Every single call made to WebGL can be found here, which is why I like to create this 
// layer of abstraction that seperates our application from the actual WebGL API. 
// It's essentially our own tiny custom graphics API.
export class RenderCommand 
{
    constructor() {}

    // Create Buffer
    public static CreateVertexBuffer(vertices : Float32Array) : VertexBuffer 
    {
        return new VertexBuffer(vertices)
    }
    public static CreateIndexBuffer(indices : Uint16Array) : IndexBuffer 
    {
        return new IndexBuffer(indices)
    }

    // Bind Buffer
    public static CreateBuffer() : WebGLBuffer 
    {
        const Id = gl.createBuffer();
        if(!Id) throw new Error("RenderCommand | Failed to create buffer!");
        return Id;
    }

    public static BindBuffer(Id : WebGLBuffer, type : BufferType) : void { 
        type == BufferType.Vertex ? gl.bindBuffer(gl.ARRAY_BUFFER, Id) 
            : gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Id);
    }

    public static UnbindBuffer(type : BufferType) {
        type == BufferType.Vertex ? gl.bindBuffer(gl.ARRAY_BUFFER, null) 
            : gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    // Set Buffer Data
    public static SetVertexBufferData(Id : WebGLBuffer, cachedVertexData : Float32Array) : void 
    {
        // Check if there's any data in the existing buffer bound to Id.
        // If there is then, we'll have to delete and create a new one, since it will be too small.
        // Otherwise, just set it with our vertex data and return void.
        const bufferSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        if(!bufferSize) 
        {            
            gl.bufferData(gl.ARRAY_BUFFER, cachedVertexData, gl.STATIC_DRAW);
            return;
        }
        
        // Delete the old one since it won't be large enough to contain new vertex data.
        this.BindBuffer(Id, BufferType.Vertex);
        gl.deleteBuffer(gl.ARRAY_BUFFER);

        // Reallocate the Id with a new buffer, and set the new vertex data.
        Id = gl.createBuffer() as WebGLBuffer;
        gl.bufferData(gl.ARRAY_BUFFER, cachedVertexData, gl.STATIC_DRAW);
    }

    public static SetIndexBufferData(Id : WebGLBuffer, cachedIndexData : Uint16Array) : void 
    {
        // Check if there's any data in the existing buffer bound to Id.
        // If there is then, we'll have to delete and create a new one, since it will be too small.
        // Otherwise, just set it with our vertex data and return void.
        const bufferSize = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE);
        if(!bufferSize) 
        {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cachedIndexData, gl.STATIC_DRAW);
            return;
        }

        // Delete the old one since it won't be large enough to contain new vertex data.
        this.BindBuffer(Id, BufferType.Index);
        gl.deleteBuffer(gl.ELEMENT_ARRAY_BUFFER);

        // Reallocate the Id with a new buffer, and set the new vertex data.
        Id = gl.createBuffer() as WebGLBuffer;
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cachedIndexData, gl.STATIC_DRAW);
    }

    // Vertex Array

    public static CreateVertexArray() : WebGLVertexArrayObject 
    {
        var temp : WebGLVertexArrayObject | null = gl.createVertexArray();
        if(!temp) throw new Error("RenderCommand | Failed to create vertex array object!");
        return temp;
    }
    public static BindVertexArray(Id : WebGLVertexArrayObject) : void
    {
        gl.bindVertexArray(Id);
    }

    public static UnbindVertexArray() : void 
    {
        gl.enableVertexAttribArray(0);
    }

    public static EnableVertexArray(layoutLoc : number) : void 
    {
        gl.enableVertexAttribArray(layoutLoc);
    }
    
    public static SetVertexArrayAttribute(layoutLoc : number, count : number, type : number, stride : number, offset : number) : void 
    {
        gl.vertexAttribPointer(layoutLoc, count, type, false, stride, offset);
    }


    // Shaders
    public static CreateShader() : WebGLProgram
    {
        const temp : WebGLProgram | null = gl.createProgram();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create shader program!");
    }
    public static UseShader(Id : WebGLProgram) : void { gl.useProgram(Id); }
    public static ReleaseShader() : void { gl.useProgram(0); }

    public static SetInt(Id : WebGLProgram, name : string, val : number) : void 
    {
        gl.uniform1i(gl.getUniformLocation(Id, name), val);
    }

    public static SetFloat(Id : WebGLProgram, name : string, val : number) : void 
    {
        gl.uniform1f(gl.getUniformLocation(Id, name), val);
    }

    public static SetVec3f(Id : WebGLProgram, name : string, val : glm.vec3) : void 
    {
        gl.uniform3f(gl.getUniformLocation(Id, name), val[0], val[1], val[2]);
    }

    public static SetVec4f(Id : WebGLProgram, name : string, val : glm.vec4) : void 
    {
        gl.uniform4f(gl.getUniformLocation(Id, name), val[0], val[1], val[2], val[3]);
    }

    public static SetMat3f(Id : WebGLProgram, name : string, val : glm.mat3) : void 
    {
        gl.uniformMatrix3fv(gl.getUniformLocation(Id, name), false, val);
    }

    public static SetMat4f(Id : WebGLProgram, name : string, val : glm.mat4) : void 
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(Id, name), false, val);
    }

    // Textures
    public static CreateTexture() : WebGLTexture 
    {
        const temp : WebGLTexture | null = gl.createTexture();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create texture!");
    }
    public static BindTexture(Id : WebGLTexture, type : TextureType, texUnit : number = 0) : void 
    {
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(ConvertTextureTypeToNative(type), Id);
    }
    public static UnBindTexture(type : TextureType, texUnit : number = 0) : void 
    {
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(ConvertTextureTypeToNative(type), 0);
    }
    public static SetTexture2DArray(config : ImageConfig, data : Uint8Array | null) : void 
    {
        gl.texImage2D(gl.TEXTURE_2D, config.MipMapLevel, ConvertImageChannelsToNative(config.NChannels), config.Width, config.Height, 0, config.Format, config.DataType, data);
    }  
    public static SetTexture2DImage(config : ImageConfig, data : HTMLImageElement) : void 
    {
        gl.texImage2D(gl.TEXTURE_2D, config.MipMapLevel, ConvertImageChannelsToNative(config.NChannels), config.Format, config.DataType, data);
    }
    public static GenerateMipMap(type : TextureType) : void 
    {
        gl.generateMipmap(type);
    }

    // Framebuffers
    public static CreateFramebuffer() : WebGLFramebuffer  
    {
        const temp : WebGLFramebuffer | null = gl.createFramebuffer();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create framebuffer!");
    }
    public static BindFramebuffer(Id : WebGLFramebuffer) : void
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, Id);
    }
    public static UnbindFramebuffer() : void
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, 0);
    }
    public static SetFramebufferColorAttachment(targetTexture : WebGLTexture, unit : number = 0) : void
    {
        const attachmentUnit = gl.COLOR_ATTACHMENT0 + unit;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentUnit, gl.TEXTURE_2D, targetTexture, 0);
    }

    // Renderbuffers
    public static CreateRenderbuffer() : WebGLRenderbuffer 
    {
        const temp : WebGLRenderbuffer | null = gl.createRenderbuffer();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create renderbuffer!");
    }
    public static BindRenderbuffer(Id : WebGLRenderbuffer) : void 
    {
        gl.bindRenderbuffer(gl.RENDERBUFFER, Id);
    }
    public static SetRenderbufferDepthAttachment(RBO : WebGLRenderbuffer, FBO: WebGLFramebuffer, config : ImageConfig) : void 
    {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, config.Width, config.Height);
        this.BindFramebuffer(FBO);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, RBO);
        this.UnbindFramebuffer();
    }
    public static UnbindRenderbuffer() : void 
    {
        gl.bindRenderbuffer(gl.RENDERBUFFER, 0);
    } 

    public static ReadFramebufferResults(buffer : {value: Uint8Array}) : void 
    {
    }


    // Rendering
    public static EnableDepthTest(b : boolean) : void
    {
        b ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
    }
    
    public static SetClearColor(color : glm.vec4) : void
    {
        gl.clearColor(color[0], color[1], color[2], color[3]);
    }

    public static ClearColorBufferBit(b : boolean) : void 
    {
        b ? gl.clear(gl.COLOR_BUFFER_BIT) : null;
    }
    public static ClearDepthBufferBit(b : boolean) : void 
    {
        b ? gl.clear(gl.DEPTH_BUFFER_BIT) : null;
    }

    // Draw Commands
    public static Draw(nVertices : number) : void 
    {
        gl.drawArrays(gl.TRIANGLES, 0, nVertices);
    }
    public static DrawIndexed(count : number, offset : number) : void
    {
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset);
    }

};