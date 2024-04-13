import RenderLayer from "../RenderLayer";
import { BufferAttribLayout, BufferAttribute, IndexBuffer, VertexBuffer } from "../Renderer/Buffer";
import Framebuffer from "../Renderer/Framebuffer";
import { RenderCommand } from "../Renderer/RenderCommand";
import Renderer from "../Renderer/Renderer";
import { Shader, ShaderDataType } from "../Renderer/Shader";
import { ImageChannels, ImageConfig, TextureType } from "../Renderer/Texture";
import VertexArray from "../Renderer/VertexArray";
import { LARGE_SQUARE_VERTCES_COMPLETE, SQUARE_INDICES } from "../Utils";

export default class ScreenQuad extends RenderLayer 
{
    constructor(name : string) 
    {
        super(name);
    }

    override Prepare(): void 
    {
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(LARGE_SQUARE_VERTCES_COMPLETE);
        VBO.SetLayout(layout);

        var EBO = new IndexBuffer(SQUARE_INDICES);
        this.vertexArray = new VertexArray(VBO, EBO);

        this.shader = Shader.Create("vScreenQuadShader", "fScreenQuadShader", "SCREEN_QUAD_SHADER");
    }

    override Render(): void 
    {
        // <-- Will be binding a texture here soon.
        RenderCommand.UseShader(this.shader.GetId());
        var tex =  Renderer.GetRenderResult("Scene");
        if(tex) RenderCommand.BindTexture(tex.GetId(), TextureType.Tex2D);
        
        RenderCommand.SetInt(this.shader.GetId(), "tex", 0); 
        
        RenderCommand.SetVec3f(this.shader.GetId(), "Color", [1.0, 0.2, 1.0]);

        Renderer.DrawVAO(this.vertexArray, this.shader);

        RenderCommand.ReleaseShader();
        RenderCommand.UnBindTexture(TextureType.Tex2D);
    }

    override Resize(): void {
        
    }

    private vertexArray !: VertexArray;
    private shader !: Shader;
}