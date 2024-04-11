import {RenderCommand, BufferType} from "./RenderCommand";
import { gl } from "../main";

interface Buffer {
    Init() : void;
};


enum ShaderDataType 
{
    None = 0, Float, Float2, Float3, Float4, Mat3f, Mat4f, Int, Int2, Int3, Int4, Bool
}

//============================================================================
// Vertex Buffer
//============================================================================

class BufferAttribute 
{   
    constructor(type : ShaderDataType, name : string, ) 
    {
        this.Type = type;
        this.Name = name;
        this.Size = GetShaderDataType(this.Type);
        this.Count = GetShaderDataTypeCount(this.Type);
    }

    public Type : ShaderDataType;
    public Name : string;
    public Offset !: number | null; // We need more context about the overall BufferAttribLayout in order to define its offset in the layout, so we'll promise the compiler that it will eventually be defined, and before we attempt to access it.
    public Size : number;
    public Count : number;
}


class BufferAttribLayout
{
    constructor(elements : Array<BufferAttribute>) 
    {
        this.attributes = this.attributes.concat(elements);
        this.CalculateStrideAndOffsets();
        this.CaclulateAttributesSize();
    }

    public attributes !: Array<BufferAttribute> 
    public size !: number;
    public stride !: number;

    public PushElement(element : BufferAttribute) : void 
    {
        this.attributes.push(element);
        this.CalculateStrideAndOffsets();
        this.CaclulateAttributesSize();
    }
    public PushElementArray(elements : Array<BufferAttribute>) : void 
    {
        this.attributes = this.attributes.concat(elements);
        this.CalculateStrideAndOffsets();
        this.CaclulateAttributesSize();
    }

    private CalculateStrideAndOffsets() : void 
    {
        var offset : number = 0;
        for(const element of this.attributes) 
        {
            element.Offset = offset;
            offset = element.Size;
            this.stride += element.Size;
        }
    }

    private CaclulateAttributesSize() : void 
    {
        for(const atttrib of this.attributes) 
        {
            this.size += atttrib.Size;
        }
    }   

    // Getters
    GetAttributes() : Array<BufferAttribute> { return this.attributes; }
}

export class VertexBuffer implements Buffer
{
    constructor(vertices : Float32Array)
    {
        this.uniqueVertexData = vertices;
    }

    public GetLayout() : BufferAttribLayout { return this.uniqueLayout; } 
    public SetLayout(layout : BufferAttribLayout) : void { 
        // Cache new vertex data into a single shared Float32Array.
        var temp = new Float32Array(VertexBuffer.cachedVertexData.length + this.uniqueVertexData.length);
        temp.set(VertexBuffer.cachedVertexData, 0);
        temp.set(this.uniqueVertexData, VertexBuffer.cachedVertexData.length);

        // Set the layout of our updated cached vertex data;
        this.uniqueLayout = layout;

        // Update existing layout properties to reflect the new layout.
        this.uniqueSize = this.uniqueLayout.size;
        this.uniqueOffset = VertexBuffer.cachedSize;
        VertexBuffer.cachedSize += this.uniqueLayout.size;

        this.Init();
    }

    public PushLayoutToBuffer() : void 
    {
        VertexBuffer.cachedLayout.concat(this.uniqueLayout);
    }

    private uniqueLayout !: BufferAttribLayout;
    
    static Id : WebGLBuffer | null = null;
    static cachedVertexData : Float32Array;
    static cachedLayout : Array<BufferAttribLayout>;
    static cachedSize : number = 0;
    
    private uniqueVertexData : Float32Array;
    private uniqueSize : number = 0
    private uniqueOffset : number = 0;

    Init() : void
    {
        // Only create a new buffer if one doesn't exist already.
        if(!VertexBuffer.Id)
            VertexBuffer.Id = RenderCommand.CreateBuffer();

        RenderCommand.BindBuffer(VertexBuffer.Id, BufferType.Vertex);
        RenderCommand.SetVertexBufferData(VertexBuffer.Id, VertexBuffer.cachedVertexData);
        RenderCommand.UnbindBuffer(BufferType.Vertex);
    }

    Resize() : void 
    {

    }
};







//============================================================================
// Index Buffer
//============================================================================

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

// Returns the size of a given shader type in bytes.
function GetShaderDataType(type: ShaderDataType) : number 
{
    switch(type) 
    {
        case ShaderDataType.Float:      return 4;
        case ShaderDataType.Float2:     return 4 * 2;
        case ShaderDataType.Float3:     return 4 * 3;
        case ShaderDataType.Float4:     return 4 * 4;
        case ShaderDataType.Mat3f:      return 4 * 3 * 3;
        case ShaderDataType.Mat4f:      return 4 * 4 * 4;
        case ShaderDataType.Int:        return 4;
        case ShaderDataType.Int2:       return 4 * 2;
        case ShaderDataType.Int3:       return 4 * 3;
        case ShaderDataType.Int4:       return 4 * 4;
        case ShaderDataType.Bool:       return 1;
    }
    console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
    return 0;
}

// Returns the number of elements of a given shader type.
function GetShaderDataTypeCount(type: ShaderDataType) : number 
{
    switch(type) 
    {
        case ShaderDataType.Float:      return 1;
        case ShaderDataType.Float2:     return 2;
        case ShaderDataType.Float3:     return 3;
        case ShaderDataType.Float4:     return 4;
        case ShaderDataType.Mat3f:      return 3*3;
        case ShaderDataType.Mat4f:      return 4*4;
        case ShaderDataType.Int:        return 1;
        case ShaderDataType.Int2:       return 2;
        case ShaderDataType.Int3:       return 3;
        case ShaderDataType.Int4:       return 4;
        case ShaderDataType.Bool:       return 1;
    }
    console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
    return 0;
}

// Returns the WebGL type equivalent of our "ShaderDataType".
function ConvertToNativeType(type: ShaderDataType) : number 
{
    switch(type) 
    {
        case ShaderDataType.Float:      return gl.FLOAT;
        case ShaderDataType.Float2:     return gl.FLOAT;
        case ShaderDataType.Float3:     return gl.FLOAT;
        case ShaderDataType.Float4:     return gl.FLOAT;
        case ShaderDataType.Mat3f:      return gl.FLOAT;
        case ShaderDataType.Mat4f:      return gl.FLOAT;
        case ShaderDataType.Int:        return gl.INT;
        case ShaderDataType.Int2:       return gl.INT;
        case ShaderDataType.Int3:       return gl.INT;
        case ShaderDataType.Int4:       return gl.INT;
        case ShaderDataType.Bool:       return gl.BOOL;
    }
    console.warn("GetShaderDataType() | Type is unknown! Returning 0!");
    return 0;
}