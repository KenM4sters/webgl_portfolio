import App from "./App.ts"
import Scene from "./Layers/Scene.ts";
import PerspectiveCamera from "./Camera/PerspectiveCamera.ts"
import ScreenQuad from "./Layers/ScreenQuad.ts";
import AssetManager from "./Layers/AssetManager.ts";
import Input from "./Input.ts";

var lastFrame : number = performance.now();

export class Animus extends App
{
    constructor() 
    {
        super();
        
        // Handle Resize Event.
        window.addEventListener("resize", () => this.Resize());

        AssetManager.LoadAllAssets(); // Load all assets.
        Input.ListenToEvents(); // Activates event listeners and provides functions to access the state of keys.

        this.Prepare(); // Prepare each render layer.
    }

    override Prepare() : void 
    {
        this.renderer.PushLayer(this.scene);
        this.renderer.PushLayer(this.screenQuad);
    }

    override Run() : void 
    {
        const currentFrame : number = performance.now();
        const deltatime : number = (currentFrame - lastFrame) * 0.001;
        lastFrame = currentFrame;
                
        // Not entirely sure what I think about passing the camera to the renderer 
        // in this fasion, but it's quite neat and makes more sense to me than the renderer
        // owning an instance of a camera.
        this.renderer.Run(this.camera, deltatime);

        this.scene.ProcessUserInput(deltatime);

        window.requestAnimationFrame(() => this.Run())        
        
    }

    override Resize(): void {
        this.ResizeCanvas();
        this.renderer.Resize();
    }

    private camera     : PerspectiveCamera  = new PerspectiveCamera([0.0, 3.0, 20.0]);
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
