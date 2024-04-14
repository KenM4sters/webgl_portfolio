import { SCREEN_HEIGHT, SCREEN_WIDTH, gl } from "../App";
import PerspectiveCamera from "../Camera/PerspectiveCamera";
import { Light } from "../Light"
import { Mesh } from "../Mesh"
import RenderLayer from "../RenderLayer";
import Framebuffer from "../Renderer/Framebuffer";
import { RenderCommand } from "../Renderer/RenderCommand";
import Renderer from "../Renderer/Renderer";
import { ImageChannels, ImageConfig, TextureType } from "../Renderer/Texture";
import VertexArray from "../Renderer/VertexArray";
import AssetManager from "./AssetManager";

// Shaders


export default class Scene extends RenderLayer
{
    constructor(name : string, camera : PerspectiveCamera) {
        super(name);
        this.camera = camera;
    }

    override Prepare(): void 
    {
        var square_geo = AssetManager.geometries["SQUARE"];
        var square_mesh = new Mesh(square_geo, 0);
        this.sceneObjects.push(square_mesh);


        // Since we'll be rendering our scene to an off-screen render buffer, and storing the results
        // in a texture to be used for the "SreenQuad" render layer, we need to define this.renderTarget
        // as our own framebuffer.
        var imageConfig : ImageConfig = {
            TargetType: gl.TEXTURE_2D,
            MipMapLevel: 0,
            NChannels: gl.RGBA,
            Width: SCREEN_WIDTH,
            Height: SCREEN_HEIGHT,
            Format: gl.RGBA,
            DataType: gl.UNSIGNED_BYTE
        }

        this.renderTarget = new Framebuffer(imageConfig);

        this.renderConfig.CacheResults = true; // When set to true, this stores the results in the renderer for free access by all layers.
        
    }

    override Render(camera : PerspectiveCamera): void 
    {
        this.Traverse((child : Mesh | Light) => 
        {
            if(child instanceof Mesh) 
            {
                let mat = AssetManager.materials[child.materialIndex];
                let shader = mat.GetShader();

                RenderCommand.UseShader(shader.GetId());
                RenderCommand.SetMat4f(shader.GetId(), "model", child.transforms.ModelMatrix);
                RenderCommand.SetMat4f(shader.GetId(), "view", camera.GetViewMatrix());
                RenderCommand.SetMat4f(shader.GetId(), "projection", camera.GetProjectionMatrix());
                RenderCommand.SetVec3f(shader.GetId(), "camera.Position", camera.position);
                
                Renderer.DrawMesh(child);
            } 
        })
    }

    override Resize(): void {

        // Delete current framebuffers, renderbuffers and textures, since they all require
        // information about our window dimensions which have now been changed. 
        if(this.renderTarget?.FBO) RenderCommand.DeleteFramebuffer(this.renderTarget.FBO);
        if(this.renderTarget?.RBO) RenderCommand.DeleteRenderBuffer(this.renderTarget.RBO);
        if(this.renderTarget?.GetColorTexture()) RenderCommand.DeleteTexture2D(this.renderTarget.GetColorTexture().GetId());

        // Instantiate a new ImageConfig object with the updated dimension parameters.
        var imageConfig : ImageConfig = {
            TargetType: gl.TEXTURE_2D,
            MipMapLevel: 0,
            NChannels: gl.RGBA,
            Width: SCREEN_WIDTH,
            Height: SCREEN_HEIGHT,
            Format: gl.RGBA,
            DataType: gl.UNSIGNED_BYTE
        }

        // Reset the renderTarget.
        this.renderTarget = new Framebuffer(imageConfig);
    }

    Push(obj : Mesh | Light) : void 
    {
        this.sceneObjects.push(obj);
    }

    Traverse(callback: (child : Mesh | Light) => void) 
    {
        for(const obj of this.sceneObjects) 
        {
            callback(obj);
        }
    }

    public sceneObjects : Array<Mesh | Light> = new Array<Mesh | Light>();
    public camera : PerspectiveCamera;
};