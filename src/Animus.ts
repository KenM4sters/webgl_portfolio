import App from "./App.ts"
import Scene from "./Layers/Scene.ts";
import PerspectiveCamera from "./Camera/PerspectiveCamera.ts"
import ScreenQuad from "./Layers/ScreenQuad.ts";


class Animus extends App
{
    constructor() 
    {
        super();
        this.Prepare();
    }

    Prepare() : void 
    {
        this.renderer.PushLayer(this.scene);
        this.renderer.PushLayer(this.screenQuad);
    }

    Run() : void 
    {
        this.renderer.Run();
        window.requestAnimationFrame(() => this.Run())        
        
    }


    private camera     : PerspectiveCamera  = new PerspectiveCamera();
    private scene      : Scene              = new Scene(this.camera);
    private screenQuad : ScreenQuad         = new ScreenQuad();
    
};



Begin();

// Begin Animus App.
function Begin() : void 
{
    const animus = new Animus();
    animus.Run();
}
