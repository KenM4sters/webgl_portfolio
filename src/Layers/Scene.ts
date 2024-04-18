import * as glm from "gl-matrix";
import { SCREEN_HEIGHT, SCREEN_WIDTH, gl } from "../App";
import PerspectiveCamera, { CameraDirections } from "../Camera/PerspectiveCamera";
import { Light, PointLight } from "../Light"
import { Mesh } from "../Mesh"
import RenderLayer from "../RenderLayer";
import Framebuffer from "../Renderer/Framebuffer";
import { RenderCommand } from "../Renderer/RenderCommand";
import Renderer from "../Renderer/Renderer";
import { ImageConfig, Texture2D, TextureType } from "../Renderer/Texture";
import AssetManager, { AssetRegistry } from "./AssetManager";
import { PhysicalMaterial } from "../Material";
import GUI from "lil-gui";
import Input from "../Input";
import { GeometryDrawFunctionShapes, GeometryDrawFunctionTypes, SphereGeometry } from "../Geometry";
import { Particles } from "../Renderer/Systems/Particles";
import { Shader } from "../Renderer/Shader";


export default class Scene extends RenderLayer
{
    constructor(name : string, camera : PerspectiveCamera) {
        super(name);
        this.camera = camera;
    }

    override Prepare(Gui : GUI): void 
    {
        // Mesh 1
        var geo1 = AssetManager.geometries.get(AssetRegistry.GEO_CUBE)
        if(!geo1) throw new Error("ASSET MANAGER | Failed to get asset!");
        geo1.drawFunction = {type: GeometryDrawFunctionTypes.DRAW_ARRAYS, shape: GeometryDrawFunctionShapes.TRIANGLES};
        var mesh1 = new Mesh(geo1, AssetRegistry.MAT_CUBE);
        mesh1.transforms.Scale = glm.vec3.fromValues(1.0, 1.66, 1.0);
        mesh1.transforms.Translation = glm.vec3.fromValues(-1.0, 0.55, 0.0);
        mesh1.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Translation);
        this.Push(mesh1);
        
        // Mesh 2
        var geo2 = AssetManager.geometries.get(AssetRegistry.GEO_CUBE);
        if(!geo2) throw new Error("ASSET MANAGER | Failed to get asset!");
        geo2.drawFunction = {type: GeometryDrawFunctionTypes.DRAW_ARRAYS, shape: GeometryDrawFunctionShapes.TRIANGLES};
        var mesh2 = new Mesh(geo2, AssetRegistry.MAT_FLOOR);
        mesh2.transforms.Scale = glm.vec3.fromValues(100.0, 0.1, 100.0);
        mesh2.transforms.Translation = glm.vec3.fromValues(0.0, -10.0, 0.0);
        mesh2.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Translation);
        this.Push(mesh2);

        // Spere
        var geo3 = new SphereGeometry(10, 100, 100);
        geo3.drawFunction = {type: GeometryDrawFunctionTypes.DRAW_ARRAYS, shape: GeometryDrawFunctionShapes.TRIANGLES_STRIP};
        var mesh3 = new Mesh(geo3, AssetRegistry.MAT_SKY);
        // this.Push(mesh3);

        // Light 1
        var light1 = new PointLight(glm.vec3.fromValues(1.0, 1.0, 1.0), 1.0);
        light1.intensity = 20.0;
        light1.color = glm.vec3.fromValues(0.07, 0.25, 0.38);
        light1.transforms.Translation = glm.vec3.fromValues(1.0, 2.0, 2.0);
        light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        this.Push(light1);

        // Render Systems
        const w : number = 100;
        const d : number = 100;
        var vertexData : Float32Array = new Float32Array(100*100*3);

        var vertexindex = 0;
        for(let col = 0; col < d; col++) 
        {
            for(let row = 0; row < w; row++) 
            {
                vertexData[vertexindex++] = (row - w/2);
                vertexData[vertexindex++] = 0
                vertexData[vertexindex++] = (col - d/2);
            }
        }   
        console.log(vertexData);
    
        this.particles = new Particles(vertexData, AssetRegistry.MAT_PARTICLES);

        // Since we'll be rendering our scene to an off-screen render buffer, and storing the results
        // in a texture to be used for the "SreenQuad" render layer, we need to define this.renderTarget
        // as our own custom framebuffer.
        var imageConfig : ImageConfig = {
            TargetType: gl.TEXTURE_2D,
            MipMapLevel: 0,
            NChannels: gl.RGBA32F,
            Width: SCREEN_WIDTH,
            Height: SCREEN_HEIGHT,
            Format: gl.RGBA,
            DataType: gl.FLOAT
        }

        this.renderTarget = new Framebuffer(imageConfig);

        this.renderConfig.CacheResults = true; // When set to true, this stores the results in the renderer for free access by all layers.

 
        // GUI Parameters
        // Cube
        const CubeFolder = Gui.addFolder('Cube');
        var cube_mat = AssetManager.materials.get(mesh1.materialKey);
        if(!cube_mat) throw new Error("Asset Manager | Failed to find asset!");
        CubeFolder.add(mesh1.transforms.Translation, '0', -100.0, 100.0, 0.01).name("PosX").onChange(() => {
            mesh1.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Translation);
        })
        CubeFolder.add(mesh1.transforms.Translation, '1', -100.0, 100.0, 0.01).name("PosY").onChange(() => {
            mesh1.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Translation);
        })
        CubeFolder.add(mesh1.transforms.Translation, '2', -100.0, 100.0, 0.01).name("PosZ").onChange(() => {
            mesh1.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Translation);
        })
        CubeFolder.add(mesh1.transforms.Scale, '0', -100.0, 100.0, 0.01).name("ScaleX").onChange(() => {
            mesh1.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Scale);
        })
        CubeFolder.add(mesh1.transforms.Scale, '1', -100.0, 100.0, 0.01).name("ScaleY").onChange(() => {
            mesh1.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Scale);
        })
        CubeFolder.add(mesh1.transforms.Scale, '2', -100.0, 100.0, 0.01).name("ScaleZ").onChange(() => {
            mesh1.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), mesh1.transforms.ModelMatrix, mesh1.transforms.Scale);
        })
        if(cube_mat instanceof PhysicalMaterial) 
        {
            CubeFolder.add(cube_mat.Metallic, 'val',  0.0, 1.0, 0.01).name("Metallic");
            CubeFolder.add(cube_mat.Roughness, 'val',  0.0, 1.0, 0.01).name("Roughness");
        }
        CubeFolder.add(cube_mat.emission, 'val',  0.0, 1.0, 0.01).name("Emission");
        CubeFolder.add(cube_mat.isUsingTextures, 'val').name("isUsingTextures");


        // Floor 
        const FloorFolder = Gui.addFolder('Floor');
        var floor_mat = AssetManager.materials.get(mesh2.materialKey);
        if(!floor_mat) throw new Error("Asset Manager | Failed to find asset!");
        FloorFolder.add(mesh2.transforms.Translation, '0', -100.0, 100.0, 0.01).name("PosX").onChange(() => {
            mesh2.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Translation);
        })
        FloorFolder.add(mesh2.transforms.Translation, '1', -100.0, 100.0, 0.01).name("PosY").onChange(() => {
            mesh2.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Translation);
        })
        FloorFolder.add(mesh2.transforms.Translation, '2', -100.0, 100.0, 0.01).name("PosZ").onChange(() => {
            mesh2.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Translation);
        })
        FloorFolder.add(mesh2.transforms.Scale, '0', -100.0, 100.0, 0.01).name("ScaleX").onChange(() => {
            mesh2.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Scale);
        })
        FloorFolder.add(mesh2.transforms.Scale, '1', -100.0, 100.0, 0.01).name("ScaleY").onChange(() => {
            mesh2.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Scale);
        })
        FloorFolder.add(mesh2.transforms.Scale, '2', -100.0, 100.0, 0.01).name("ScaleZ").onChange(() => {
            mesh2.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), mesh2.transforms.ModelMatrix, mesh2.transforms.Scale);
        })
        if(floor_mat instanceof PhysicalMaterial) 
        {
            FloorFolder.add(floor_mat.Metallic, 'val',  0.0, 1.0, 0.01).name("Metallic");
            FloorFolder.add(floor_mat.Roughness, 'val',  0.0, 1.0, 0.01).name("Roughness");
        }
        FloorFolder.add(floor_mat.emission, 'val',  0.0, 1.0, 0.01).name("Emission");
        FloorFolder.add(floor_mat.isUsingTextures, 'val').name("isUsingTextures");
        
        // Lights

        const LightsFolder = Gui.addFolder("Lights");

        LightsFolder.add(light1.transforms.Translation, '0', -100.0, 100.0, 0.01).name("Light1|PosX").onChange(() => {
            light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        })
        LightsFolder.add(light1.transforms.Translation, '1', -100.0, 100.0, 0.01).name("Light1|PosY").onChange(() => {
            light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        })
        LightsFolder.add(light1.transforms.Translation, '2', -100.0, 100.0, 0.01).name("Light1|PosZ").onChange(() => {
            light1.transforms.ModelMatrix = glm.mat4.translate(glm.mat4.create(), light1.transforms.ModelMatrix, light1.transforms.Translation);
        })
        LightsFolder.add(light1, 'intensity', 0.0, 50.0, 0.02).name("Light1|Intensity");
        LightsFolder.add(light1.color, '0', -1.0, 1.0, 0.01).name("Light1|ColorR");
        LightsFolder.add(light1.color, '1', -1.0, 1.0, 0.01).name("Light1|ColorG");
        LightsFolder.add(light1.color, '2', -1.0, 1.0, 0.01).name("Light1|ColorB");
    }

    override Render(camera : PerspectiveCamera): void 
    {
        this.Traverse((child : Mesh) => 
        {
            // May end up adding all objects (lights, materials etc) into this.
            if(child instanceof Mesh) 
            {
                let mat = AssetManager.materials.get(child.materialKey);

                if(mat instanceof PhysicalMaterial) 
                {
                    let shader = mat.GetShader();
                    let Id = shader.GetId();

                    child.transforms.ModelMatrix = glm.mat4.create();
                    child.transforms.ModelMatrix =  glm.mat4.scale(glm.mat4.create(), child.transforms.ModelMatrix, child.transforms.Scale);
                    child.transforms.ModelMatrix =  glm.mat4.translate(glm.mat4.create(), child.transforms.ModelMatrix, child.transforms.Translation);

                    // Clear up any texture units that we may need in case they weren't from the pervious render pass.
                    RenderCommand.UnBindTexture(TextureType.Tex2D, 0);
                    RenderCommand.UnBindTexture(TextureType.Tex2D, 1);
                    RenderCommand.UnBindTexture(TextureType.Tex2D, 2);
                    RenderCommand.UnBindTexture(TextureType.Tex2D, 3);

                    // Important uniforms for transforming coordinates between spaces.
                    RenderCommand.UseShader(Id);
                    RenderCommand.SetMat4f(Id, "model", child.transforms.ModelMatrix);
                    RenderCommand.SetMat4f(Id, "view", camera.GetViewMatrix());
                    RenderCommand.SetMat4f(Id, "projection", camera.GetProjectionMatrix());
                    RenderCommand.SetVec3f(Id, "camera.Position", camera.position);
                    RenderCommand.SetBool(Id, "IsUsingTextures", mat.isUsingTextures.val);

                    // Material Props - Could be either a texture or a float/array, so we need to check each property and assign it the correct unifrom.
                    if(mat.isUsingTextures.val) {RenderCommand.SetInt(Id, "material.Albedo", 0); RenderCommand.BindTexture(mat.Albedo.tex.GetId(), TextureType.Tex2D, 0)}
                    else RenderCommand.SetVec3f(Id, "rawMaterial.Albedo", mat.Albedo.val as glm.vec3);
                    if(mat.isUsingTextures.val) {RenderCommand.SetInt(Id, "material.Metallic", 1); RenderCommand.BindTexture(mat.Metallic.tex.GetId(), TextureType.Tex2D, 1)}
                    else RenderCommand.SetFloat(Id, "rawMaterial.Metallic", mat.Metallic.val as number);
                    if(mat.isUsingTextures.val) {RenderCommand.SetInt(Id, "material.Roughness", 2); RenderCommand.BindTexture(mat.Roughness.tex.GetId(), TextureType.Tex2D, 2)}
                    else RenderCommand.SetFloat(Id, "rawMaterial.Roughness", mat.Roughness.val as number);
                    if(mat.isUsingTextures.val) {RenderCommand.SetInt(Id, "material.AO", 3); RenderCommand.BindTexture(mat.AO.tex.GetId(), TextureType.Tex2D, 3)}
                    else RenderCommand.SetFloat(Id, "rawMaterial.AO", mat.AO.val as number); 
                    
                    RenderCommand.SetFloat(Id, "rawMaterial.Emission", mat.emission.val); // Only really makes sense for a raw material.

                    // Loop through each light and set their uniform data.
                    for(const light of this.lights)
                    {
                        var light_index : number = 1;
                        RenderCommand.SetVec3f(Id, "light" + light_index + ".Position", light.transforms.Translation);
                        RenderCommand.SetVec3f(Id, "light" + light_index + ".Color", light.color);
                        RenderCommand.SetFloat(Id, "light" + light_index + ".Intensity", light.intensity);
                        light_index++;
                    }
                }
                
                // This function handles calling the appropriate draw call based on whether we're using indices or not.
                Renderer.DrawMesh(child);
                // Clear up the textures that were used for our materials.
                RenderCommand.UnBindTexture(TextureType.Tex2D, 0);
                RenderCommand.UnBindTexture(TextureType.Tex2D, 1);
                RenderCommand.UnBindTexture(TextureType.Tex2D, 2);
                RenderCommand.UnBindTexture(TextureType.Tex2D, 3);
            } 
        })

        const particlesMat = AssetManager.materials.get(this.particles.materialKey);
        const shaderId = particlesMat?.GetShader().GetId();
        if(!shaderId) throw new Error("Shader was not found!");
        RenderCommand.UseShader(shaderId);
        RenderCommand.SetMat4f(shaderId, "model", this.particles.transforms.ModelMatrix);
        RenderCommand.SetMat4f(shaderId, "view", camera.GetViewMatrix());
        RenderCommand.SetMat4f(shaderId, "projection", camera.GetProjectionMatrix());
        RenderCommand.SetVec3f(shaderId, "camera.Position", camera.position);
        Renderer.DrawParticles(this.particles);
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
            NChannels: gl.RGBA32F,
            Width: SCREEN_WIDTH,
            Height: SCREEN_HEIGHT,
            Format: gl.RGBA,
            DataType: gl.FLOAT
        }

        // Reset the renderTarget.
        this.renderTarget = new Framebuffer(imageConfig);
    }

    override ProcessUserInput(dt : number): void 
    {
        Input.IsKeyPressed("w") ? this.camera.ProcessUserInput(CameraDirections.FORWARD, dt) : null;
        Input.IsKeyPressed("a") ? this.camera.ProcessUserInput(CameraDirections.LEFT, dt) : null;
        Input.IsKeyPressed("s") ? this.camera.ProcessUserInput(CameraDirections.BACKWARD, dt) : null;
        Input.IsKeyPressed("d") ? this.camera.ProcessUserInput(CameraDirections.RIGHT, dt) : null;
        Input.IsKeyPressed("q") ? this.camera.ProcessUserInput(CameraDirections.UP, dt) : null;
        Input.IsKeyPressed("e") ? this.camera.ProcessUserInput(CameraDirections.DOWN, dt) : null;
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
    public particles !: Particles;
    public camera : PerspectiveCamera;
};