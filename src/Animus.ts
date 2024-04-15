import App from "./App.ts"
import Scene from "./Layers/Scene.ts";
import PerspectiveCamera from "./Camera/PerspectiveCamera.ts"
import ScreenQuad from "./Layers/ScreenQuad.ts";
import AssetManager from "./Layers/AssetManager.ts";

export class Animus extends App
{
    constructor() 
    {
        super();
        
        // Event listeners.
        window.addEventListener("resize", () => this.Resize());
        window.addEventListener("mousemove", (event : MouseEvent) => this.HandleUserInput(event))
        window.addEventListener("keydown", (event : KeyboardEvent) => this.HandleUserInput(event));

        AssetManager.LoadAllAssets(); // Load all assets.

        this.Prepare(); // Prepare each render layer.
    }

    override Prepare() : void 
    {
        this.renderer.PushLayer(this.scene);
        this.renderer.PushLayer(this.screenQuad);
    }

    override Run() : void 
    {
        // Not entirely sure what I think about passing the camera to the renderer 
        // in this fasion, but it's quite neat and makes more sense to me than the renderer
        // owning an instance of a camera.
        this.renderer.Run(this.camera);
        window.requestAnimationFrame(() => this.Run())        
        
    }

    override Resize(): void {
        this.ResizeCanvas();
        this.renderer.Resize();
    }


    HandleUserInput(event : KeyboardEvent | MouseEvent) : void 
    {
        this.scene.ProcessUserInput(event);
        this.screenQuad.ProcessUserInput(event);
    }


    private camera     : PerspectiveCamera  = new PerspectiveCamera([0.0, 0.0, 5.0]);
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
