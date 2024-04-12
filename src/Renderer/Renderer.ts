import { BufferType, RenderCommand } from "./RenderCommand";
import { Shader } from "./Shader";
import VertexArray from "./VertexArray";
import RenderLayer from "../RenderLayer";
import { IndexBuffer } from "./Buffer";
import { Texture2D } from "./Texture";

export class RenderResult 
{
    constructor(result : Texture2D | null) 
    {
        this.result = result;
    }

    GetResult() : Texture2D | null {return this.result;}
    SetResult(result : Texture2D | null) : void { this.result = result; }

    private result !: Texture2D | null;
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

    // Getters & Setters
    GetRenderLayers() : Array<RenderLayer> { return this.layers; }
    GetRenderResult(key : string) : RenderResult | null 
    {
        if(this.results[key]) return this.results[key];
        else throw new Error(`Renderer | Failed to find render result with key : ${key}`);
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
    // Remembder - Order here matters: the renderer will iterate through this from [0] to [length-1].
    private layers : Array<RenderLayer> = new Array<RenderLayer>();

    // Currently not being used, but I think it could come in handy down the road.
    private results : {[key : string]: RenderResult} = {};
};