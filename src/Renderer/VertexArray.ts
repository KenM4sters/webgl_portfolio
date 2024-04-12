import { VertexBuffer, IndexBuffer } from "./Buffer";
import { BufferType, RenderCommand } from "./RenderCommand";
import { ConvertShaderTypeToNative } from "./Shader";


export default class VertexArray 
{
    constructor(vBuffer : VertexBuffer, iBuffer : IndexBuffer | null = null) 
    {
        this.vertexBuffer = vBuffer;
        this.indexBuffer = iBuffer;
        this.Init();
    } 
    
    // Getters
    GetId() : WebGLVertexArrayObject { return this.Id; }
    GetVertexBuffer() : VertexBuffer { return this.vertexBuffer; }
    GetIndexBuffer() : IndexBuffer | null { return this.indexBuffer; }

    private Id : WebGLVertexArrayObject = 0;
    private vertexBuffer : VertexBuffer; 
    private indexBuffer : IndexBuffer | null = null;

    Init() : void 
    {
        this.Id = RenderCommand.CreateVertexArray();
        RenderCommand.BindVertexArray(this.Id);
        RenderCommand.BindBuffer(VertexBuffer.Id as WebGLBuffer, BufferType.Vertex);
        if(this.indexBuffer)
            RenderCommand.BindBuffer(IndexBuffer.Id as WebGLBuffer, BufferType.Index);
 
        var layoutLoc = 0;
        for(const attrib of this.vertexBuffer.GetUniqueLayout().GetAttributes()) 
        {
            var uniqueLayout = this.vertexBuffer.GetUniqueLayout();
            var layoutOffset = VertexBuffer.cachedSize - (this.vertexBuffer.GetUniqueVertexData().length * this.vertexBuffer.GetUniqueVertexData().BYTES_PER_ELEMENT); // computes the offset due to preceding layouts.
            
            RenderCommand.SetVertexArrayAttribute(layoutLoc, attrib.Count, ConvertShaderTypeToNative(attrib.Type), uniqueLayout.stride, layoutOffset + attrib.Offset); // Remember to add the unique offset of the attribute itself to the layout offset.
            RenderCommand.EnableVertexArray(layoutLoc); // Don't forget to enable the layout location.
            layoutLoc++;
        }

        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Vertex);
        if(this.indexBuffer)
            RenderCommand.UnbindBuffer(BufferType.Index);
    }
};