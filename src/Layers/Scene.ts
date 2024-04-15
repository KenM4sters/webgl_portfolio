import * as glm from "gl-matrix";
import { SCREEN_HEIGHT, SCREEN_WIDTH, gl } from "../App";
import PerspectiveCamera, { CameraDirections } from "../Camera/PerspectiveCamera";
import { Light } from "../Light"
import { Mesh } from "../Mesh"
import RenderLayer from "../RenderLayer";
import { VertexBuffer } from "../Renderer/Buffer";
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
        var geo1 = AssetManager.geometries["CUBE"];
        var mesh1 = new Mesh(geo1, 0);
        mesh1.transforms.Translation = glm.vec3.fromValues(-1.0, 0.0, 0.0);
        mesh1.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Translation);
        this.Push(mesh1);

        var geo2 = AssetManager.geometries["CUBE"];
        var mesh2 = new Mesh(geo2, 0);
        mesh2.transforms.Translation = glm.vec3.fromValues(1.0, 0.0, 0.0);
        mesh2.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Translation);
        this.Push(mesh2);
        
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

    override ProcessUserInput(event : KeyboardEvent | MouseEvent): void 
    {
        if(event instanceof KeyboardEvent) 
        {
            if(event.key == "w") this.camera.ProcessUserInput(CameraDirections.FORWARD);
            if(event.key == "a") this.camera.ProcessUserInput(CameraDirections.LEFT);
            if(event.key == "s") this.camera.ProcessUserInput(CameraDirections.BACKWARD);
            if(event.key == "d") this.camera.ProcessUserInput(CameraDirections.RIGHT);
            if(event.key == "q") this.camera.ProcessUserInput(CameraDirections.UP);
            if(event.key == "e") this.camera.ProcessUserInput(CameraDirections.DOWN);
        }
    }   

    public Push(obj : Mesh | Light) : void 
    {
        this.sceneObjects.push(obj);
    }

    public Traverse(callback: (child : Mesh | Light) => void) 
    {
        for(const obj of this.sceneObjects) 
        {
            callback(obj);
        }
    }

    public sceneObjects : Array<Mesh | Light> = new Array<Mesh | Light>();
    public camera : PerspectiveCamera;
};