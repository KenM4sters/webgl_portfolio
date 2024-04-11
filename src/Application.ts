import {gl} from "./main.ts"
import Renderer from "./Renderer/Renderer.ts";

export default class App {
    constructor() 
    {
        this.Init();
        this.Triangle();
        this.loop();
    }

    private isRunning : boolean = true;
    private renderer = new Renderer() as Renderer;
    
    Init() : void
    {
            
    }

    Triangle() : void
    {
        gl.createBuffer();
    }

    loop() : void
    {
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
    }    
};