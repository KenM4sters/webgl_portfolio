import RenderLayer, { FramebufferBits } from "../RenderLayer";
import { IndexBuffer, VertexBuffer } from "./Buffer";
import { BufferType, RenderCommand } from "./RenderCommand";
import * as glm from "gl-matrix";
import { gl } from "../App";
import { Shader } from "./Shader";

import VertexArray from "./VertexArray";

export class RenderResult 
{
    constructor() 
    {

    }

    GetResult() : Uint8Array {return this.result;}
    SetResult(result : Uint8Array) : void { this.result = result; }

    private result : Uint8Array = new Uint8Array();
};



export default class Renderer 
{
    constructor() {}


    public PushLayer(layer : RenderLayer) : void
    {
        layer.Prepare();
        this.layers.push(layer);
    }

    public Run() : void
    {
        for(const layer of this.layers) 
        {
            this.RenderLayer(layer);
        }
    }

    private RenderLayer(layer : RenderLayer) : void
    {   
        // Get Props.
        let framebuffer = layer.GetRenderTarget()?.FBO
        let config = layer.GetRenderConfig();

        // Set Framebuffer.
        if(framebuffer) RenderCommand.BindFramebuffer(framebuffer); else RenderCommand.UnbindFramebuffer();
        
        // Set Render configurations.
        RenderCommand.EnableDepthTest(config.DepthTest);
        RenderCommand.ClearColorBufferBit(config.ClearColorBit);
        RenderCommand.ClearDepthBufferBit(config.ClearDepthBit);
        RenderCommand.SetClearColor([0.1, 0.1, 0.1, 1.0]);

        // Render the layer.
        layer.Render();

        // Cleanup.
        if(framebuffer) RenderCommand.UnbindFramebuffer();

    }






    //============================================================
    // Helper functions that take the load off the RenderCommand.
    //============================================================

    // Renders the VAO to the target framebuffer of the render layer that is currently active.
    public static DrawVAO(VAO : VertexArray, shader : Shader) : void {
        // Bind the vertex array object and shader program.
        RenderCommand.BindVertexArray(VAO.GetId());
        RenderCommand.UseShader(shader.GetId());


        // Only call DrawIndexed() if the index buffer isn't null.
        var EBO = VAO.GetIndexBuffer();
        if(EBO && IndexBuffer.Id) 
        {
            // RenderCommand.BindBuffer(IndexBuffer.Id, BufferType.Index)
            RenderCommand.DrawIndexed(EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT , EBO.GetUniqueOffset());
        } else {
            RenderCommand.Draw(6);
        }

        // Cleanup.
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
    }








    // Holds all the layers that the renderer will run through.
    // Rememder - Order here matters: the renderer will iterate through this from [0] to [length-1].
    private layers : Array<RenderLayer> = new Array<RenderLayer>();

    // Currently not being used, but I think it could come in handy down the road.
    private results : {[key : string]: RenderResult} = {};
};