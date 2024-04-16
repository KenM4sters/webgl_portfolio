import {gl} from "../App.ts";
import * as glm from "gl-matrix";
import { VertexBuffer, IndexBuffer, Id } from "./Buffer.ts";
import { TextureType, ImageConfig, ImageChannels, ConvertTextureTypeToNative, ConvertImageChannelsToNative, TexData } from "./Texture.ts";
import { ConvertBitsToNative, FramebufferBits } from "../RenderLayer.ts";
import { ConvertShaderTypeToNative, GetShaderDataType } from "./Shader.ts";

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

    public static BindBuffer(Id : Id<WebGLBuffer | null>, type : BufferType) : void { 
        if(Id.val && type == BufferType.Vertex) gl.bindBuffer(gl.ARRAY_BUFFER, Id.val) 
        else if(Id.val && type == BufferType.Index) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Id.val);
        else throw new Error("RenderCommand | Failed to bind buffer! Id::Val is null!");
    }

    public static UnbindBuffer(type : BufferType) {
        type == BufferType.Vertex ? gl.bindBuffer(gl.ARRAY_BUFFER, null) 
            : gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    // Set Buffer Data
    public static SetVertexBufferData(Id : Id<WebGLBuffer | null>, cachedVertexData : Float32Array) : void 
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
        gl.deleteBuffer(Id.val);

        // Reallocate the Id with a new buffer, and set the new vertex data.
        Id.val = gl.createBuffer();
        this.BindBuffer(Id, BufferType.Vertex);
        gl.bufferData(gl.ARRAY_BUFFER, cachedVertexData, gl.STATIC_DRAW);
    }

    public static SetIndexBufferData(Id : Id<WebGLBuffer | null>, cachedIndexData : Uint16Array) : void 
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
        gl.deleteBuffer(Id.val);

        // Reallocate the Id with a new buffer, and set the new vertex data.
        Id.val = gl.createBuffer() as WebGLBuffer;
        this.BindBuffer(Id, BufferType.Index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cachedIndexData, gl.STATIC_DRAW);
    }

    // Vertex Array

    public static CreateVertexArray() : WebGLVertexArrayObject 
    {
        var temp : WebGLVertexArrayObject | null = gl.createVertexArray();
        if(!temp) throw new Error("RenderCommand | Failed to create vertex array object!");
        return temp;
    }
    public static BindVertexArray(Id : Id<WebGLVertexArrayObject | null>) : void
    {
        if(Id.val) gl.bindVertexArray(Id.val);
        else throw new Error("RenderCommand | Failed to bind vertex array object! Id::val is null!")
    }

    public static UnbindVertexArray() : void 
    {
        gl.bindVertexArray(null);
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
        if(temp) return temp;
        throw new Error("RenderCommand | Failed to create shader program!");
    }

    public static UseShader(Id : Id<WebGLProgram | null>) : void 
    { 
        if(Id.val) gl.useProgram(Id.val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!");
    }

    public static ReleaseShader() : void 
    { 
        gl.useProgram(null); 
    }

    public static SetInt(Id : Id<WebGLProgram | null>, name : string, val : number) : void 
    {
        if(Id.val) gl.uniform1i(gl.getUniformLocation(Id.val, name), val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetFloat(Id : Id<WebGLProgram | null>, name : string, val : number) : void 
    {
        if(Id.val) gl.uniform1f(gl.getUniformLocation(Id.val, name), val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetVec2f(Id : Id<WebGLProgram | null>, name : string, val : glm.vec2) : void 
    {        
        if(Id.val) gl.uniform2f(gl.getUniformLocation(Id.val, name), val[0], val[1]); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }
    public static SetVec3f(Id : Id<WebGLProgram | null>, name : string, val : glm.vec3) : void 
    {
        if(Id.val) gl.uniform3f(gl.getUniformLocation(Id.val, name), val[0], val[1], val[2]); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetVec4f(Id : Id<WebGLProgram | null>, name : string, val : glm.vec4) : void 
    {
        if(Id.val) gl.uniform4f(gl.getUniformLocation(Id.val, name), val[0], val[1], val[2], val[3]); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetMat3f(Id : Id<WebGLProgram | null>, name : string, val : glm.mat3) : void 
    {
        if(Id.val) gl.uniformMatrix3fv(gl.getUniformLocation(Id.val, name), false, val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    public static SetMat4f(Id : Id<WebGLProgram | null>, name : string, val : glm.mat4) : void 
    {
        if(Id.val) gl.uniformMatrix4fv(gl.getUniformLocation(Id.val, name), false, val); 
        else throw new Error("RenderCommand | Failed to use shader program! Id::Val is null!")
    }

    // Textures
    public static CreateTexture() : WebGLTexture 
    {
        const temp : WebGLTexture | null = gl.createTexture();        
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create texture!");
    }
    public static BindTexture(Id : Id<WebGLTexture | null>, type : TextureType, texUnit : number = 0) : void 
    {
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(ConvertTextureTypeToNative(type), Id.val);
    }
    public static UnBindTexture(type : TextureType, texUnit : number = 0) : void 
    {
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(ConvertTextureTypeToNative(type), null);
    }
    public static SetTexture2DArray(config : ImageConfig, data : TexData<Uint8Array | Float32Array | null>) : void 
    {
        // if(data instanceof HTMLImageElement) throw new Error("RenderCommand | Calling SetTexture2DArray on an image element!");
        // Initialize texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // Set data.
        gl.texImage2D(config.TargetType, config.MipMapLevel, config.NChannels, config.Width, config.Height, 0, config.Format, config.DataType, data.val);          
    }  
    public static SetTexture2DImage(config : ImageConfig, data : HTMLImageElement) : void 
    {
        gl.texImage2D(config.TargetType, config.MipMapLevel, config.NChannels, config.Format, config.DataType, data);
    }
    public static GenerateMipMap(type : TextureType) : void 
    {
        gl.generateMipmap(type);
    }
    public static DeleteTexture2D(Id : Id<WebGLTexture | null>) : void 
    {
        gl.deleteTexture(Id.val);
    }

    // Framebuffers
    public static CreateFramebuffer() : WebGLFramebuffer  
    {
        const temp : WebGLFramebuffer | null = gl.createFramebuffer();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create framebuffer!");
    }
    public static BindFramebuffer(Id : Id<WebGLFramebuffer | null>) : void
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, Id.val);
    }
    public static UnbindFramebuffer() : void
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    public static SetFramebufferColorAttachment(targetTexture : Id<WebGLTexture | null>, unit : number = 0) : void
    {
        const attachmentUnit = gl.COLOR_ATTACHMENT0 + unit;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentUnit, gl.TEXTURE_2D, targetTexture.val, 0); 
        
        // Check for any errors.
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            console.error('Framebuffer is not complete: ' + status.toString(16));
        }    
    }
    public static DrawFramebuffer(attachments : number[]) : void 
    {
        gl.drawBuffers(attachments);
    }

    public static DeleteFramebuffer(FBO : Id<WebGLFramebuffer | null>) 
    {
        if(!FBO) console.warn("RenderCommand | Attempting to delete a null framebuffer!");
        gl.deleteFramebuffer(FBO.val);        
    }

    // Renderbuffers
    public static CreateRenderbuffer() : WebGLRenderbuffer 
    {
        const temp : WebGLRenderbuffer | null = gl.createRenderbuffer();
        if(temp) 
            return temp;
        throw new Error("RenderCommand | Failed to create renderbuffer!");
    }
    public static BindRenderbuffer(Id : Id<WebGLRenderbuffer | null>) : void 
    {
        gl.bindRenderbuffer(gl.RENDERBUFFER, Id.val);
    }
    public static SetRenderbufferDepthAttachment(RBO : Id<WebGLRenderbuffer | null>, FBO: Id<WebGLFramebuffer | null>, config : ImageConfig) : void 
    {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, config.Width, config.Height);
        this.BindFramebuffer(FBO);
        this.BindRenderbuffer(RBO);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, RBO.val);
        this.UnbindFramebuffer();
    }
    public static UnbindRenderbuffer() : void 
    {
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    } 

    public static DeleteRenderBuffer(RBO : Id<WebGLRenderbuffer | null>) 
    {
        if(!RBO) console.warn("RenderCommand | Attempting to delete a null renderbuffer!");
        gl.deleteRenderbuffer(RBO.val);        
    }

    public static ReadFramebufferResults(buffer : {value: Uint8Array}) : void 
    {        
    }


    // Rendering

    public static SetViewportDimensions(width : number, height : number) : void 
    {
        gl.viewport(0, 0, width, height);
    }

    public static EnableDepthTest(b : boolean) : void
    {
        b ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
    }

    public static EnableAdditiveBlending(b : boolean) : void
    {
        b ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
    }
    public static SetBlendFunc(a : number, b : number) : void
    {
        gl.blendFunc(a, b);
    }
    public static SetBlendEquation(e : number) : void
    {
        gl.blendEquation(e);
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