import GUI from "lil-gui";
import * as glm from "gl-matrix"
import RenderLayer from "../RenderLayer";
import PerspectiveCamera from "../Camera/PerspectiveCamera";
import { ImageConfig, Texture2D, TextureType } from "../Renderer/Texture";
import { SCREEN_HEIGHT, SCREEN_WIDTH, gl } from "../App";
import AssetManager, { AssetRegistry } from "./AssetManager";
import { RenderCommand } from "../Renderer/RenderCommand";
import Renderer from "../Renderer/Renderer";
import { Mesh } from "../Mesh";
import Framebuffer from "../Renderer/Framebuffer";
import { Id } from "../Renderer/Buffer";
import { Shader } from "../Renderer/Shader";


interface BloomControls 
{
    nMipMaps : number;
    FilterRadius : number;
};

export default class BloomPass extends RenderLayer
{   
    constructor(name : string) 
    {
        super(name);
    }

    override Prepare(Gui: GUI): void 
    {
        var screen_geo = AssetManager.geometries.get(AssetRegistry.GEO_SQUARE);
        if(!screen_geo) throw new Error("ASSET MANAGER | Failed to get asset!");
        this.mesh = new Mesh(screen_geo, AssetRegistry.MAT_DOWNSAMPLE);

        var bloomImageConfig : ImageConfig = 
        {
            TargetType: gl.TEXTURE_2D,
            MipMapLevel: 0,
            NChannels: gl.RGBA32F,
            Width: SCREEN_WIDTH,
            Height: SCREEN_HEIGHT,
            Format: gl.RGBA,
            DataType: gl.FLOAT
        }

        this.renderTarget = new Framebuffer(bloomImageConfig);
        this.renderConfig.CacheResults = true;

        var mipSize : glm.vec2 = glm.vec2.fromValues(SCREEN_WIDTH, SCREEN_HEIGHT);
        var iMipSize : glm.vec2 = glm.vec2.fromValues(Math.floor(SCREEN_WIDTH), Math.floor(SCREEN_HEIGHT));

        for(let i = 0; i < this.bloomParams.nMipMaps; i++) 
        {   
            mipSize = glm.vec2.scale(glm.vec2.create(), mipSize, 0.5);
            iMipSize = glm.vec2.scale(glm.vec2.create(), iMipSize, 0.5);

            var mipConfig : ImageConfig = 
            {
                TargetType: gl.TEXTURE_2D,
                MipMapLevel: 0,
                NChannels: gl.RGBA32F,
                Width: mipSize[0],
                Height: mipSize[1],
                Format: gl.RGBA,
                DataType: gl.FLOAT
            }
            
            this.mipChain.push(Texture2D.Create(mipConfig, "mipTexture" + i));
        }
        this.bloomFBO = new Framebuffer(this.mipChain[0], false);
        RenderCommand.BindFramebuffer(this.bloomFBO.FBO);

        var attachments : number[] = [ gl.COLOR_ATTACHMENT0 ];

        RenderCommand.DrawFramebuffer(attachments);
        RenderCommand.UnbindFramebuffer();

        var upsampleShader = AssetManager.materials.get(AssetRegistry.MAT_UPSAMPLE)?.GetShader();
        var downsampleShader = AssetManager.materials.get(AssetRegistry.MAT_DOWNSAMPLE)?.GetShader();
        if(!upsampleShader) throw new Error("ASSET MANAGER | Failed to get asset!");
        if(!downsampleShader) throw new Error("ASSET MANAGER | Failed to get asset!");
        this.upsampleShader = upsampleShader as Shader;
        this.downsampleShader = downsampleShader as Shader;
        
        // Prepping uniform locations for the source HDR texture from the Scene class.
        RenderCommand.UseShader(this.upsampleShader.GetId());
        RenderCommand.SetInt(this.upsampleShader.GetId(), "srcTexture", 0);
        RenderCommand.ReleaseShader();
        RenderCommand.UseShader(this.downsampleShader.GetId());
        RenderCommand.SetInt(this.downsampleShader.GetId(), "srcTexture", 0);
        RenderCommand.ReleaseShader();
    }


    override Render(camera: PerspectiveCamera): void 
    {
        // Get the source HDR scene texture from renderer and make sure it's valid.
        this.srcTexture = Renderer.GetRenderResult("Scene");
        if(!this.srcTexture) throw new Error("Renderer | Failed to get render result from scene!");
        // Get material from the asset manager and check it's valid.
        var mat = AssetManager.materials.get(this.mesh.materialKey);
        if(!mat) throw new Error("ASSET MANAGER | Failed to get asset!");

        RenderCommand.BindFramebuffer(this.bloomFBO.FBO); // Make sure you've bound the bloomFBO.

        // Firstly, we downsample the source texture 'BloomControls.nMipMap' times.
        this.RenderDownSamples();
        // Secondly, we upsample and blur the texture until it's back to the original dimensions.
        this.RenderUpSamples();

        RenderCommand.UnbindFramebuffer();
        RenderCommand.SetViewportDimensions(SCREEN_WIDTH, SCREEN_HEIGHT); // !!Remember to set the viewport dimnesions back to the screen width and height.

        RenderCommand.BindFramebuffer(this.renderTarget?.FBO as Id<WebGLFramebuffer | null>);

        // Finally, draw our mesh (fullscreen 2d quad) to the screen with the upsampled, blurred texture.
        RenderCommand.UseShader(mat.GetShader().GetId()); 
        RenderCommand.BindTexture(this.mipChain[0].GetId(), TextureType.Tex2D);
        Renderer.DrawMesh(this.mesh);

        RenderCommand.ReleaseShader();
        RenderCommand.UnBindTexture(TextureType.Tex2D);
    }

    override Resize(): void 
    {
        if(this.renderTarget?.FBO) RenderCommand.DeleteFramebuffer(this.renderTarget.FBO);
        if(this.renderTarget?.RBO) RenderCommand.DeleteRenderBuffer(this.renderTarget.RBO);
        if(this.renderTarget?.GetColorTexture()) RenderCommand.DeleteTexture2D(this.renderTarget.GetColorTexture().GetId());
        if(this.bloomFBO) RenderCommand.DeleteFramebuffer(this.bloomFBO.FBO);

        for(let i = 0; i < this.bloomParams.nMipMaps; i++) 
        {
            RenderCommand.DeleteTexture2D(this.mipChain[i].GetId());
        }
        this.mipChain = new Array<Texture2D>();

        var bloomImageConfig : ImageConfig = 
        {
            TargetType: gl.TEXTURE_2D,
            MipMapLevel: 0,
            NChannels: gl.RGBA32F,
            Width: SCREEN_WIDTH,
            Height: SCREEN_HEIGHT,
            Format: gl.RGBA,
            DataType: gl.FLOAT
        }

        this.renderTarget = new Framebuffer(bloomImageConfig);

        var mipSize : glm.vec2 = glm.vec2.fromValues(SCREEN_WIDTH, SCREEN_HEIGHT);
        var iMipSize : glm.vec2 = glm.vec2.fromValues(Math.floor(SCREEN_WIDTH), Math.floor(SCREEN_HEIGHT));

        for(let i = 0; i < this.bloomParams.nMipMaps; i++) 
        {   
            mipSize = glm.vec2.scale(glm.vec2.create(), mipSize, 0.5);
            iMipSize = glm.vec2.scale(glm.vec2.create(), iMipSize, 0.5);

            var mipConfig : ImageConfig = 
            {
                TargetType: gl.TEXTURE_2D,
                MipMapLevel: 0,
                NChannels: gl.RGBA32F,
                Width: mipSize[0],
                Height: mipSize[1],
                Format: gl.RGBA,
                DataType: gl.FLOAT
            }
            
            this.mipChain.push(Texture2D.Create(mipConfig, "mipTexture" + i));
        }
        this.bloomFBO = new Framebuffer(this.mipChain[0], false);
        RenderCommand.BindFramebuffer(this.bloomFBO.FBO);

        var attachments : number[] = [ gl.COLOR_ATTACHMENT0 ];

        RenderCommand.DrawFramebuffer(attachments);
        RenderCommand.UnbindFramebuffer();
    }

    override ProcessUserInput(dt: number): void {}

    RenderDownSamples() : void 
    {
        RenderCommand.UseShader(this.downsampleShader?.GetId());
        RenderCommand.BindTexture(this.srcTexture?.GetId() as Id<WebGLBuffer | null>, TextureType.Tex2D);

        for(let i = 0; i < this.mipChain.length; i ++) 
        {
            const bloomMip = this.mipChain[i];
            var mipConfig = bloomMip.GetConfig();
            
            RenderCommand.SetViewportDimensions(mipConfig.Width, mipConfig.Height);
            RenderCommand.SetFramebufferColorAttachment(bloomMip.GetId(), 0);
            
            RenderCommand.UseShader(this.downsampleShader?.GetId());
            RenderCommand.SetVec2f(this.downsampleShader.GetId(), "srcResolution", glm.vec2.fromValues(mipConfig.Width, mipConfig.Height));

            
            Renderer.DrawMesh(this.mesh);
            
            RenderCommand.UnBindTexture(TextureType.Tex2D);
            RenderCommand.BindTexture(bloomMip.GetId(), TextureType.Tex2D);
        }

        RenderCommand.ReleaseShader();

    }
    RenderUpSamples() : void 
    {
        this.mesh.materialKey = AssetRegistry.MAT_UPSAMPLE;

        RenderCommand.UseShader(this.upsampleShader.GetId());
        RenderCommand.SetFloat(this.upsampleShader.GetId(), "filterRadius", this.bloomParams.FilterRadius);

        RenderCommand.EnableAdditiveBlending(true);
        RenderCommand.SetBlendFunc(gl.ONE, gl.ONE);
        RenderCommand.SetBlendEquation(gl.FUNC_ADD);

        for(let i = this.mipChain.length - 1; i > 0; i--) 
        {
            const bloomMip = this.mipChain[i];
            const nextBloomMip = this.mipChain[i - 1]; // Remember we're going backwards.);
            
            RenderCommand.BindTexture(bloomMip.GetId(), TextureType.Tex2D);
            RenderCommand.SetViewportDimensions(nextBloomMip.GetConfig().Width, nextBloomMip.GetConfig().Height);

            RenderCommand.SetFramebufferColorAttachment(nextBloomMip.GetId(), 0);
            Renderer.DrawMesh(this.mesh);
        }

        RenderCommand.EnableAdditiveBlending(false);
        RenderCommand.ReleaseShader();
        RenderCommand.UnBindTexture(TextureType.Tex2D);
    }

    GetMesh() : Mesh { return this.mesh; }
    GetMipChain() : Array<Texture2D> { return this.mipChain; }
    GetFBO() : Framebuffer { return this.bloomFBO; }
    
    private mesh !: Mesh;
    private mipChain : Array<Texture2D> = Array<Texture2D>();
    private bloomFBO !: Framebuffer;
    private srcTexture !: Texture2D | null;
    private upsampleShader !: Shader;
    private downsampleShader !: Shader;
    private bloomParams : BloomControls = 
        { 
            nMipMaps: 5,
            FilterRadius: 0.001
        }

}