import { VertexBuffer, IndexBuffer } from "./Buffer";


export default class VertexArray 
{
    constructor(vBuffer : VertexBuffer, iBuffer : IndexBuffer | null = null) 
    {
        this.vertexBuffer = vBuffer;
        this.indexBuffer = iBuffer;
        this.Init();
    } 
    
    // Getters
    GetVertexBuffer() : VertexBuffer { return this.vertexBuffer; }
    GetIndexBuffer() : IndexBuffer | null { return this.indexBuffer; }

    private Id : WebGLVertexArrayObject = 0;
    private vertexBuffer : VertexBuffer; 
    private indexBuffer : IndexBuffer | null;

    Init() : void 
    {
    }
};