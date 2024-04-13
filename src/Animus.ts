import App from "./App.ts"
import Scene from "./Layers/Scene.ts";
import PerspectiveCamera from "./Camera/PerspectiveCamera.ts"
import ScreenQuad from "./Layers/ScreenQuad.ts";

export class Animus extends App
{
    constructor() 
    {
        super();
        // Event listeners.
        window.addEventListener("resize", () => this.Resize());
        this.Prepare();
    }

    override Prepare() : void 
    {
        this.renderer.PushLayer(this.scene);
        this.renderer.PushLayer(this.screenQuad);
    }

    override Run() : void 
    {
        this.renderer.Run();
        window.requestAnimationFrame(() => this.Run())        
        
    }

    override Resize(): void {
        this.ResizeCanvas();
        this.renderer.Resize();
    }


    private camera     : PerspectiveCamera  = new PerspectiveCamera();
    private scene      : Scene              = new Scene("Scene", this.camera);
    private screenQuad : ScreenQuad         = new ScreenQuad("ScreenQuad");    
};



Begin();

// Begin Animus App.
function Begin() : void 
{
    const animus = new Animus();
    animus.Run();
}
