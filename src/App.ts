import { RenderCommand } from "./Renderer/RenderCommand";
import Renderer from "./Renderer/Renderer";

var canvas = document.querySelector("#glcanvas") as HTMLCanvasElement | null;
if (!canvas) throw new Error("#glcanvas cannot be found!");

export var gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
if (!gl) throw new Error("webgl context is not available!");

const devicePixelRatio = window.devicePixelRatio || 1;

export var SCREEN_WIDTH : number = canvas.width * Math.max(devicePixelRatio, 2);
export var SCREEN_HEIGHT : number = canvas.height * Math.max(devicePixelRatio, 2);


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

        SCREEN_WIDTH = canvasWidth * Math.max(devicePixelRatio, 2);
        SCREEN_HEIGHT = canvasHeight * Math.max(devicePixelRatio, 2);

        RenderCommand.SetViewportDimensions(SCREEN_WIDTH, SCREEN_HEIGHT);

        this.canvas.width = Math.round(SCREEN_WIDTH);
        this.canvas.height = Math.round(SCREEN_HEIGHT);        
    }

    protected renderer : Renderer = new Renderer();
    protected canvas : HTMLCanvasElement | null = document.querySelector("#glcanvas") as HTMLCanvasElement | null
};