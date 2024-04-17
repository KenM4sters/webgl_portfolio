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
import { Geometry, GeometryDrawFunctionTypes } from "../Geometry";

export default class Renderer 
{
    constructor() 
    {
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
        RenderCommand.SetClearColor([0.0, 0.01, 0.04, 1.0]);


        // Render the layer.
        layer.Render(camera);         
                
        if(framebuffer?.FBO && config.CacheResults) Renderer.results[layer.name] = framebuffer?.GetColorTexture();

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

    public static DrawMesh(mesh : Mesh) : void {

        var shader = AssetManager.materials.get(mesh.materialKey)?.GetShader();
        if(!shader) throw new Error("ASSET MANAGER | Failed to get asset!");
        
        var VAO = mesh.geometry.vertexArray;

        // Bind the vertex array object and shader program.
        RenderCommand.BindVertexArray(VAO.GetId());
        RenderCommand.UseShader(shader.GetId());

        // Only call DrawIndexed() if the index buffer isn't null.
        var EBO = VAO.GetIndexBuffer();

        switch(mesh.geometry.drawFunction.type) 
        {
            case GeometryDrawFunctionTypes.DRAW_ARRAYS: RenderCommand.Draw(mesh.geometry.drawFunction.shape, VAO.GetVertexBuffer().GetVerticesCount()); break;
            case GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED: if(EBO) RenderCommand.DrawIndexed(mesh.geometry.drawFunction.shape, EBO.GetUniqueSize() / EBO.GetUniqueIndices().BYTES_PER_ELEMENT , EBO.GetUniqueOffset()); break; 
        };

        // Cleanup.
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
        RenderCommand.ReleaseShader();

    }

    // Holds all the layers that the renderer will run through.
    // Remember - Order here matters: the renderer will iterate through this from [0] to [length-1].
    private static layers : Array<RenderLayer> = new Array<RenderLayer>();

    // This container holds all of the resultant textures from rendering that our layers have
    // decided they want to make available for other layers to read from.
    public static results : {[key : string]: Texture2D} = {};

    // Gui
    private Gui : GUI = new GUI();
};