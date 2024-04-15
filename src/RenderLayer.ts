import Framebuffer from "./Renderer/Framebuffer.ts";
import { gl } from "./App.ts";
import PerspectiveCamera from "./Camera/PerspectiveCamera.ts";
import GUI from "lil-gui";

export enum FramebufferBits 
{
    DEPTH_BIT,
    COLOR_BIT,
};

export interface RenderConfig 
{
    DepthTest : boolean;
    ClearColorBit : boolean;
    ClearDepthBit : boolean;
    CacheResults : boolean;
};



export default abstract class RenderLayer 
{
    constructor(public name : string) {}

    abstract Prepare(Gui : GUI) : void;
    abstract Render(camera : PerspectiveCamera) : void;
    abstract Resize() : void;
    abstract ProcessUserInput(dt : number) : void;

    // Get/Set the framebuffer that this layer renders to.
    GetRenderTarget() : Framebuffer | null { return this.renderTarget; }
    SetRenderTarget(target : Framebuffer) { this.renderTarget = target; }

    // Get/Set the render configuration that describes which properties should be set when rendering this layer.
    GetRenderConfig() : RenderConfig { return this.renderConfig; }
    SetRenderConfig(config : RenderConfig) : void { this.renderConfig = config }

    protected renderTarget : Framebuffer | null = null;
    protected renderConfig : RenderConfig = 
    {
        DepthTest : true,
        ClearColorBit: true,
        ClearDepthBit: true,
        CacheResults: false 
    };
};




export function ConvertBitsToNative(type: FramebufferBits) : number 
{
    switch(type) 
    {
        case FramebufferBits.COLOR_BIT: return gl.COLOR_BUFFER_BIT;
        case FramebufferBits.DEPTH_BIT: return gl.DEPTH_BUFFER_BIT;
    }

    return 0;
}