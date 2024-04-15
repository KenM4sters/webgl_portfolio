import { BufferType, RenderCommand } from "./RenderCommand";
import { Shader } from "./Shader";
import VertexArray from "./VertexArray";
import RenderLayer from "../RenderLayer";
import { IndexBuffer } from "./Buffer";
import { Texture2D, TextureType } from "./Texture";
import { Mesh } from "../Mesh";
import AssetManager from "../Layers/AssetManager";
import PerspectiveCamera from "../Camera/PerspectiveCamera";
import GUI from "lil-gui";

export default class Renderer 
{
    constructor() {
        this.pixels = new Uint8Array(window.innerWidth * window.innerHeight * 4);
    }

    pixels : Uint8Array;


    public PushLayer(layer : RenderLayer) : void
    {
        layer.Prepare(this.Gui);
        Renderer.layers.push(layer);
    }

    public Run(camera: PerspectiveCamera, dt : number) : void
    {
        for(const layer of Renderer.layers) 
        {
            this.RenderLayer(layer, camera, dt);
        }
    }

    private RenderLayer(layer : RenderLayer, camera : PerspectiveCamera, dt : number) : void
    {   
        // Get Props.
        let framebuffer = layer.GetRenderTarget()
        let config = layer.GetRenderConfig();

        // Set Framebuffer.
        if(framebuffer?.FBO) 
        {
            RenderCommand.BindFramebuffer(framebuffer.FBO);
            RenderCommand.BindRenderbuffer(framebuffer.RBO);              
            RenderCommand.BindTexture(framebuffer.GetColorTexture().GetId(), TextureType.Tex2D);
        } else {
            RenderCommand.UnbindFramebuffer();
            RenderCommand.UnbindRenderbuffer();
            RenderCommand.UnBindTexture(TextureType.Tex2D);
        }

        // Set Render configurations.
        RenderCommand.EnableDepthTest(config.DepthTest);
        RenderCommand.ClearColorBufferBit(config.ClearColorBit);
        RenderCommand.ClearDepthBufferBit(config.ClearDepthBit);
        RenderCommand.SetClearColor([0.1, 0.1, 0.1, 1.0]);


        // Render the layer.
        layer.Render(camera);
                
        if(framebuffer?.FBO && config.CacheResults) Renderer.results[layer.name] = framebuffer?.GetColorTexture();
        // if(framebuffer?.FBO) console.log(framebuffer.GetColorTexture());

        // Cleanup.
        if(framebuffer?.FBO) RenderCommand.UnbindFramebuffer();
        if(framebuffer?.RBO) RenderCommand.UnbindRenderbuffer();
        if(framebuffer?.GetColorTexture()) RenderCommand.UnBindTexture(TextureType.Tex2D);
    }

    Resize() : void 
    {
        for(const layer of Renderer.layers) 
        {
            layer.Resize();
        }
    }

    // Getters & Setters
    public static GetRenderLayers() : Array<RenderLayer> { return Renderer.layers; }
    public static GetRenderResult(key : string) : Texture2D | null 
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
            RenderCommand.Draw(VAO.GetVertexBuffer().GetVerticesCount());
        }

        // Cleanup.
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
        RenderCommand.ReleaseShader();

    }

    public static DrawMesh(mesh : Mesh) : void {

        var shader = AssetManager.materials[mesh.materialIndex].GetShader();
        var VAO = mesh.geometry.vertexArray;

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
            RenderCommand.Draw(mesh.geometry.vertexArray.GetVertexBuffer().GetVerticesCount());
        }

        // Cleanup.
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
        RenderCommand.ReleaseShader();

    }

    // Holds all the layers that the renderer will run through.
    // Remember - Order here matters: the renderer will iterate through this from [0] to [length-1].
    private static layers : Array<RenderLayer> = new Array<RenderLayer>();

    // Currently not being used, but I think it could come in handy down the road.
    private static results : {[key : string]: Texture2D} = {};

    // Gui
    private Gui : GUI = new GUI();
};