import GUI from "lil-gui";
import { Mesh } from "../Mesh";
import RenderLayer from "../RenderLayer";
import { RenderCommand } from "../Renderer/RenderCommand";
import Renderer from "../Renderer/Renderer";
import { TextureType } from "../Renderer/Texture";
import AssetManager, { AssetRegistry } from "./AssetManager";

interface RenderControls 
{
    Exposure : number;
    BloomStrength : number;
};

export default class ScreenPass extends RenderLayer 
{
    constructor(name : string) 
    {
        super(name);
    }

    override Prepare(Gui : GUI): void 
    {
        var screen_geo = AssetManager.geometries.get(AssetRegistry.GEO_SQUARE);
        if(!screen_geo) throw new Error("ASSET MANAGER | Failed to get asset!");
        this.mesh = new Mesh(screen_geo, AssetRegistry.MAT_HDR);

        Gui.add(this.renderControls, "Exposure", 0, 50, 0.1);
        Gui.add(this.renderControls, "BloomStrength", 0, 1, 0.01);
    }

    override Render(): void 
    {
        var mat = AssetManager.materials.get(this.mesh.materialKey);
        if(!mat) throw new Error("ASSET MANAGER | Failed to get asset!");

        RenderCommand.UseShader(mat.GetShader().GetId());
        var rawScene = Renderer.GetRenderResult("Scene");
        var blurredScene = Renderer.GetRenderResult("BloomPass");

        if(rawScene) RenderCommand.BindTexture(rawScene.GetId(), TextureType.Tex2D);        
        if(blurredScene) RenderCommand.BindTexture(blurredScene.GetId(), TextureType.Tex2D, 1);        

        RenderCommand.SetInt(mat.GetShader().GetId(), "sceneTex", 0); 
        RenderCommand.SetInt(mat.GetShader().GetId(), "blurredTex", 1); 
        RenderCommand.SetFloat(mat.GetShader().GetId(), "Exposure", this.renderControls.Exposure);
        RenderCommand.SetFloat(mat.GetShader().GetId(), "BloomStrength", this.renderControls.BloomStrength);

        Renderer.DrawMesh(this.mesh);

        RenderCommand.ReleaseShader();
        RenderCommand.UnBindTexture(TextureType.Tex2D);
    }

    override Resize(): void {
        
    }

    override ProcessUserInput(dt : number): void 
    {
        
    }

    private mesh !: Mesh;
    private renderControls : RenderControls = 
        {
            Exposure : 0.8,
            BloomStrength:  0.3
        };
}