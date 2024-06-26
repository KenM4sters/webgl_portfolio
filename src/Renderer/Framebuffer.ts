import { Id } from "./Buffer";
import { RenderCommand } from "./RenderCommand";
import { Texture2D, ImageConfig } from "./Texture";


/**
 * The Framebuffer class handles the generation of a new framebuffers and renderbuffers and stores
 * there Id's to be accessed by the render layers. It also handles the creation of a texture and binds
 * it as the color attachment for the Framebuffer object. This can also be retrieved.
 *  
 */
export default class Framebuffer 
{
    constructor(targetTexConfig : ImageConfig) {
        this.colorTexture = Texture2D.Create(targetTexConfig, "scene_tex");
        this.Resize();
    }

    public FBO : Id<WebGLFramebuffer | null> = {val: null};
    public RBO : Id<WebGLRenderbuffer | null> = {val: null};
    private colorTexture : Texture2D;

    // Getters
    GetFBO() : WebGLFramebuffer { return this.FBO; }
    GetRBO() : WebGLRenderbuffer { return this.RBO; }
    GetColorTexture() : Texture2D { return this.colorTexture; }

    Resize() 
    {
        // Create a new framebuffer with an empty texture to insert data into.
        this.FBO = {val: RenderCommand.CreateFramebuffer()};
        RenderCommand.BindFramebuffer(this.FBO);
        RenderCommand.SetFramebufferColorAttachment(this.colorTexture.GetId());

        // We also need a render buffer to store depth information that tells WebGL
        // which pixels to clip when one is infront of the other, otherwise nothing will look 3D.
        this.RBO = {val: RenderCommand.CreateRenderbuffer()};
        RenderCommand.BindRenderbuffer(this.RBO);
        RenderCommand.SetRenderbufferDepthAttachment(this.RBO, this.FBO, this.colorTexture.GetConfig());

        // Cleanup.
        RenderCommand.UnbindFramebuffer();
        RenderCommand.UnbindRenderbuffer();
    }

};
