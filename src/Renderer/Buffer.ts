import {RenderCommand, BufferType} from "./RenderCommand";

interface Buffer {
    Init() : void;
};

export class VertexBuffer implements Buffer
{
    constructor(vertices : Float32Array) {

        this.lastVertices = vertices;
        
        this.Init();
    }

    private Id : WebGLBuffer = 0;
    private lastVertices : Float32Array;

    Init() : void
    {
        RenderCommand.BindBuffer(this.Id, BufferType.Vertex);
        RenderCommand.SetVertexBufferData(this.lastVertices);
        RenderCommand.UnbindBuffer(BufferType.Vertex);
    }

    Resize() : void 
    {

    }
};

export class IndexBuffer implements Buffer  
{
    constructor(indices : Uint16Array) {
        this.indices = indices;
        this.Init();
    }

    private Id : WebGLBuffer = 0;
    private indices : Uint16Array;

    Init() : void
    {
        RenderCommand.BindBuffer(this.Id, BufferType.Index);
        RenderCommand.SetIndexBufferData(this.indices);
        RenderCommand.UnbindBuffer(BufferType.Index);
    }
};