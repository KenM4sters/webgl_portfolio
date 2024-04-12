import { RenderCommand } from "./RenderCommand";
import { Texture2D, ImageConfig } from "./Texture";


export default class Framebuffer 
{
    constructor(targetTexConfig : ImageConfig) {
        this.colorTexture = Texture2D.Create(targetTexConfig);
        this.Init();
    }

    FBO : WebGLFramebuffer = 0;
    RBO : WebGLRenderbuffer = 0;
    colorTexture : Texture2D;

    // Getters
    GetFBO() : WebGLFramebuffer { return this.FBO; }
    GetRBO() : WebGLRenderbuffer { return this.RBO; }
    GetColorTexture() : Texture2D { return this.colorTexture; }

    Init() 
    {
        // Create a new framebuffer with an empty texture to insert data into.
        this.FBO = RenderCommand.CreateFramebuffer();
        RenderCommand.BindFramebuffer(this.FBO);
        RenderCommand.SetFramebufferColorAttachment(this.colorTexture.GetId());

        // We also need a render buffer to store depth information that tells WebGL
        // which pixels to clip when one is infront of the other, otherwise nothing will look 3D.
        this.RBO = RenderCommand.CreateRenderbuffer();
        RenderCommand.BindRenderbuffer(this.RBO);
        RenderCommand.SetRenderbufferDepthAttachment(this.RBO, this.FBO, this.colorTexture.GetConfig());

        // Cleanup.
        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnbindRenderbuffer();
    }

};
