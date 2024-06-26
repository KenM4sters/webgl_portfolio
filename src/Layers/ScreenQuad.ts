import GUI from "lil-gui";
import { Geometry } from "../Geometry";
import { Mesh } from "../Mesh";
import RenderLayer from "../RenderLayer";
import { RenderCommand } from "../Renderer/RenderCommand";
import Renderer from "../Renderer/Renderer";
import { TextureType } from "../Renderer/Texture";
import AssetManager from "./AssetManager";

interface RenderControls 
{
    Exposure : number;
};

export default class ScreenQuad extends RenderLayer 
{
    constructor(name : string) 
    {
        super(name);
    }

    override Prepare(Gui : GUI): void 
    {
        var screen_geo : Geometry = AssetManager.geometries["SQUARE"];
        this.mesh = new Mesh(screen_geo, 1);

        Gui.add(this.renderControls, "Exposure", 0, 50, 0.1);
    }

    override Render(): void 
    {
        var mat = AssetManager.materials[this.mesh.materialIndex];

        // <-- Will be binding a texture here soon.
        RenderCommand.UseShader(mat.GetShader().GetId());
        var tex = Renderer.GetRenderResult("Scene");
        if(tex) RenderCommand.BindTexture(tex.GetId(), TextureType.Tex2D);        

        RenderCommand.SetInt(mat.GetShader().GetId(), "tex", 0); 
        RenderCommand.SetVec3f(mat.GetShader().GetId(), "Color", [1.0, 0.2, 1.0]);
        RenderCommand.SetFloat(mat.GetShader().GetId(), "Exposure", this.renderControls.Exposure);

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
    private renderControls : RenderControls = {Exposure : 0.8};
}