import GUI from "lil-gui";
import RenderLayer from "../RenderLayer";
import PerspectiveCamera from "../Camera/PerspectiveCamera";

export default class BloomPass extends RenderLayer
{   
    constructor(name : string) 
    {
        super(name);
    }

    override Prepare(Gui: GUI): void {
        
    }

    override Render(camera: PerspectiveCamera): void {
        
    }

    override Resize(): void {
        
    }

    override ProcessUserInput(dt: number): void {}

    RenderDownSamples() : void 
    {

    }
    RenderUpSamples() : void 
    {

    }
}