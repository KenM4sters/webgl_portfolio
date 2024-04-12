import Renderer from "./Renderer/Renderer";


export var canvas = document.querySelector("#glcanvas") as HTMLCanvasElement | null;
if (canvas == null) throw new Error("#glcanvas cannot be found!");

export var gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
if (gl == null) throw new Error("webgl context is not available!");


export default abstract class App {
    constructor() 
    {

    } 
    
    abstract Run() : void;
    abstract Prepare() : void;

    protected renderer : Renderer = new Renderer();
};