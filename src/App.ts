import { RenderCommand } from "./Renderer/RenderCommand";
import Renderer from "./Renderer/Renderer";

var canvas = document.querySelector("#glcanvas") as HTMLCanvasElement | null;
if (canvas == null) throw new Error("#glcanvas cannot be found!");

export var gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
if (gl == null) throw new Error("webgl context is not available!");

export var SCREEN_WIDTH : number = window.innerWidth * Math.max(window.devicePixelRatio, 2);
export var SCREEN_HEIGHT : number = window.innerHeight * Math.max(window.devicePixelRatio, 2);


export default abstract class App {
    constructor() 
    {
        this.Resize();
    } 
    
    abstract Prepare() : void;
    abstract Run() : void;
    abstract Resize() : void;

    ResizeCanvas() : void 
    {
        if(!this.canvas) return; // If the canvas is null, then don't bother resizing it.

        var canvasWidth = this.canvas.width;
        var canvasHeight = this.canvas.height;

        if(canvasWidth != window.innerWidth || canvasHeight != window.innerHeight) 
        {
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
        }

        SCREEN_WIDTH = canvasWidth * Math.max(window.devicePixelRatio, 2);
        SCREEN_HEIGHT = canvasHeight * Math.max(window.devicePixelRatio, 2);

        RenderCommand.SetViewportDimensions(SCREEN_WIDTH, SCREEN_HEIGHT);

    }

    protected renderer : Renderer = new Renderer();
    protected canvas : HTMLCanvasElement | null = document.querySelector("#glcanvas") as HTMLCanvasElement | null
};