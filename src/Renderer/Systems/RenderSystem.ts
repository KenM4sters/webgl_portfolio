import { VertexBuffer } from "../Buffer";


export abstract class RenderSystem 
{
    constructor(data : Float32Array) 
    {
        this.vertexBuffer = new VertexBuffer(data);
    }

    vertexBuffer : VertexBuffer;
};