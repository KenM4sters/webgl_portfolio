import App from "./App.ts"
import Renderer from "./Renderer/Renderer.ts";
import Scene from "./Scene.ts";
import PerspectiveCamera from "./Camera/PerspectiveCamera.ts"


class Animus extends App
{
    constructor() 
    {
        super();
        this.Prepare();
    }

    Prepare() : void 
    {

    }

    Run() : void 
    {
        
    }

    private camera   : PerspectiveCamera  = new PerspectiveCamera();
};



Begin();

// Begin Animus App.
function Begin() : void 
{
    const animus = new Animus();
    animus.Run();
}
