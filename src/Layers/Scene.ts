import * as glm from "gl-matrix";
import { SCREEN_HEIGHT, SCREEN_WIDTH, gl } from "../App";
import PerspectiveCamera, { CameraDirections } from "../Camera/PerspectiveCamera";
import { Light, PointLight } from "../Light"
import { Mesh } from "../Mesh"
import RenderLayer from "../RenderLayer";
import Framebuffer from "../Renderer/Framebuffer";
import { RenderCommand } from "../Renderer/RenderCommand";
import Renderer from "../Renderer/Renderer";
import { ImageConfig, Texture2D } from "../Renderer/Texture";
import AssetManager from "./AssetManager";
import { PhysicalMaterial } from "../Material";
import GUI from "lil-gui";

// Shaders


export default class Scene extends RenderLayer
{
    constructor(name : string, camera : PerspectiveCamera) {
        super(name);
        this.camera = camera;
    }

    override Prepare(): void 
    {
        // Mesh 1
        var geo1 = AssetManager.geometries["CUBE"];
        var mesh1 = new Mesh(geo1, 0);
        mesh1.transforms.Translation = glm.vec3.fromValues(-1.0, 0.0, 0.0);
        mesh1.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Translation);
        this.Push(mesh1);
        // Mesh 2
        var geo2 = AssetManager.geometries["CUBE"];
        var mesh2 = new Mesh(geo2, 0);
        mesh2.transforms.Translation = glm.vec3.fromValues(1.0, 0.0, 0.0);
        mesh2.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Translation);
        this.Push(mesh2);

        // Light 1
        var light1 = new PointLight(glm.vec3.fromValues(1.0, 1.0, 1.0), 1.0);
        light1.transforms.Translation = glm.vec3.fromValues(1.0, 2.0, 2.0);
        light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        this.Push(light1);

        
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

        var gui = new GUI();
        gui.add(mesh1.transforms.Translation, '0' , -5.0, 5.0, 0.01);


    }

    override Render(camera : PerspectiveCamera): void 
    {
        this.Traverse((child : Mesh) => 
        {
            // May end up adding all objects (lights, materials etc) into this.
            if(child instanceof Mesh) 
            {
                let mat = AssetManager.materials[child.materialIndex];

                if(mat instanceof PhysicalMaterial) 
                {
                    let shader = mat.GetShader();
                    let Id = shader.GetId();
    
                    RenderCommand.UseShader(Id);
                    RenderCommand.SetMat4f(Id, "model", child.transforms.ModelMatrix);
                    RenderCommand.SetMat4f(Id, "view", camera.GetViewMatrix());
                    RenderCommand.SetMat4f(Id, "projection", camera.GetProjectionMatrix());
                    RenderCommand.SetVec3f(Id, "camera.Position", camera.position);
                    
                    mat.Albedo instanceof Texture2D ? console.log("texture mat") : RenderCommand.SetVec3f(Id, "material.Albedo", mat.Albedo);
                    mat.Metallic instanceof Texture2D ? console.log("texture mat") : RenderCommand.SetFloat(Id, "material.Metallic", mat.Metallic);
                    mat.Roughness instanceof Texture2D ? console.log("texture mat") : RenderCommand.SetFloat(Id, "material.Roughness", mat.Roughness);
                    mat.AO instanceof Texture2D ? console.log("texture mat") : RenderCommand.SetFloat(Id, "material.AO", mat.AO);

                    for(const light of this.lights) 
                    {
                        var light_index : number = 1;
                        RenderCommand.SetVec3f(Id, "light" + light_index + ".Position", light.transforms.Translation);
                        RenderCommand.SetVec3f(Id, "light" + light_index + ".Color", light.color);
                        RenderCommand.SetFloat(Id, "light" + light_index + ".Intensity", light.intensity);
                        // console.log("light" + light_index + ".Position");
                        light_index++;
                    }
                }
                
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
        if(obj instanceof Mesh) this.meshes.push(obj);
        if(obj instanceof Light) this.lights.push(obj);
    }

    public Traverse(callback: (child : Mesh) => void) 
    {
        for(const obj of this.meshes) 
        {
            callback(obj);
        }
    }

    public meshes : Array<Mesh> = new Array<Mesh>();
    public lights : Array<Light> = new Array<Light>();
    public camera : PerspectiveCamera;
};