import { gl } from "../App";
import PerspectiveCamera from "../Camera/PerspectiveCamera";
import { Light } from "../Light"
import { Mesh } from "../Mesh"
import RenderLayer from "../RenderLayer";
import { BufferAttribLayout, BufferAttribute, IndexBuffer, VertexBuffer } from "../Renderer/Buffer";
import Framebuffer from "../Renderer/Framebuffer";
import Renderer from "../Renderer/Renderer";
import { Shader, ShaderDataType } from "../Renderer/Shader";
import { ImageChannels, ImageConfig, TextureType } from "../Renderer/Texture";
import VertexArray from "../Renderer/VertexArray";
import { SQUARE_INDICES, SQUARE_VERTCES_COMPLETE } from "../Utils";

export default class Scene extends RenderLayer
{
    constructor(camera : PerspectiveCamera) {
        super();
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
        var VBO = new VertexBuffer(SQUARE_VERTCES_COMPLETE);
        VBO.SetLayout(layout);

        var EBO = new IndexBuffer(SQUARE_INDICES);
        this.vertexArray = new VertexArray(VBO, EBO);

        this.shader = Shader.Create("vBasicShader", "fBasicShader", "SCREEN_QUAD_SHADER");

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
    }

    override Render(): void 
    {
        Renderer.DrawVAO(this.vertexArray, this.shader);
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