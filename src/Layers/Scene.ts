import PerspectiveCamera from "../Camera/PerspectiveCamera";
import { Light } from "../Light"
import { Mesh } from "../Mesh"
import RenderLayer from "../RenderLayer";
import { BufferAttribLayout, BufferAttribute, IndexBuffer, VertexBuffer } from "../Renderer/Buffer";
import Framebuffer from "../Renderer/Framebuffer";
import { RenderCommand } from "../Renderer/RenderCommand";
import Renderer from "../Renderer/Renderer";
import { Shader, ShaderDataType } from "../Renderer/Shader";
import { ImageChannels, ImageConfig, TextureType } from "../Renderer/Texture";
import VertexArray from "../Renderer/VertexArray";
import {SMALL_SQUARE_VERTCES_COMPLETE, SQUARE_INDICES } from "../Utils";

export default class Scene extends RenderLayer
{
    constructor(name : string, camera : PerspectiveCamera) {
        super(name);
        this.camera = camera;
    }

    override Prepare(): void 
    {
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(SMALL_SQUARE_VERTCES_COMPLETE);
        VBO.SetLayout(layout);

        var EBO = new IndexBuffer(SQUARE_INDICES);
        this.vertexArray = new VertexArray(VBO, EBO);

        this.shader = Shader.Create("vBasicShader", "fBasicShader", "SCREEN_QUAD_SHADER");

        // Since we'll be rendering our scene to an off-screen render buffer, and storing the results
        // in a texture to be used for the "SreenQuad" render layer, we need to define this.renderTarget
        // as our own framebuffer.
        var imageConfig : ImageConfig = {
            TargetType: TextureType.Tex2D,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA,
            Width: window.innerWidth,
            Height: window.innerHeight,
            Format: ImageChannels.RGBA,
            DataType: ShaderDataType.UCHAR
        }

        this.renderTarget = new Framebuffer(imageConfig);

        this.renderConfig.CacheResults = true; // When set to true, this stores the results in the renderer for free access by all layers.
        
    }

    override Render(): void 
    {
        Renderer.DrawVAO(this.vertexArray, this.shader);
    }

    override Resize(): void {

        // Delete current framebuffers, renderbuffers and textures, since they all require
        // information about our window dimensions which have now been changed. 
        if(this.renderTarget?.FBO) RenderCommand.DeleteFramebuffer(this.renderTarget.FBO);
        if(this.renderTarget?.RBO) RenderCommand.DeleteRenderBuffer(this.renderTarget.RBO);
        if(this.renderTarget?.colorTexture) RenderCommand.DeleteTexture2D(this.renderTarget.colorTexture.GetId());

        // Instantiate a new ImageConfig object with the updated dimension parameters.
        var imageConfig : ImageConfig = {
            TargetType: TextureType.Tex2D,
            MipMapLevel: 0,
            NChannels: ImageChannels.RGBA,
            Width: window.innerWidth,
            Height: window.innerHeight,
            Format: ImageChannels.RGBA,
            DataType: ShaderDataType.UCHAR
        }

        // Reset the renderTarget.
        this.renderTarget = new Framebuffer(imageConfig);
    }

    Push(obj : Mesh | Light) : void 
    {
        this.sceneObjects.push(obj);
    }

    Traverse(callback: (child : Mesh | Light) => {}) 
    {
        for(const obj of this.sceneObjects) 
        {
            callback(obj);
        }
    }

    public sceneObjects : Array<Mesh | Light> = new Array<Mesh | Light>();
    public camera : PerspectiveCamera;

    private shader !: Shader;
    private vertexArray !: VertexArray;

};