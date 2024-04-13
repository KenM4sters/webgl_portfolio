import { RenderCommand } from "./Renderer/RenderCommand";
import Renderer from "./Renderer/Renderer";

var canvas = document.querySelector("#glcanvas") as HTMLCanvasElement | null;
if (canvas == null) throw new Error("#glcanvas cannot be found!");

export var gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
if (gl == null) throw new Error("webgl context is not available!");


export default abstract class App {
    constructor() 
    {
        this.Resize();
        if(this.canvas) RenderCommand.SetViewportDimensions(this.canvas.width, this.canvas.height);
    } 
    
    abstract Prepare() : void;
    abstract Run() : void;
    abstract Resize() : void;

    ResizeCanvas() : void 
    {
        if(!this.canvas) return; // If the canvas is null, then don't bother resizing it.

        const displayWidth  = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // Check if the canvas size matches the display size
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            // Set the canvas size to match the display size
            this.canvas.width  = displayWidth;
            this.canvas.height = displayHeight;

            // Update the WebGL viewport to match the new this.canvas size
            RenderCommand.SetViewportDimensions(this.canvas.width, this.canvas.height);
        }
    }

    protected renderer : Renderer = new Renderer();
    protected canvas : HTMLCanvasElement | null = document.querySelector("#glcanvas") as HTMLCanvasElement | null
};