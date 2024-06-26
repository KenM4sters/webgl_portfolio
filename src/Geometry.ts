import { BufferAttribLayout, BufferAttribute, IndexBuffer, VertexBuffer } from "./Renderer/Buffer";
import { ShaderDataType } from "./Renderer/Shader";
import VertexArray from "./Renderer/VertexArray";
import { CUBE_INDICES, CUBE_VERTICES_COMPLETE, LARGE_SQUARE_VERTCES_COMPLETE, SQUARE_INDICES } from "./Utils";



export abstract class Geometry 
{
    constructor() {}

    public vertexArray !: VertexArray;

}


export class SquareGeometry extends Geometry
{
    constructor() 
    {
        super();
        
        const vertices = LARGE_SQUARE_VERTCES_COMPLETE;
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
        var EBO = new IndexBuffer(SQUARE_INDICES);

        this.vertexArray = new VertexArray(VBO, EBO);
    }
};

export class CubeGeometry extends Geometry
{
    constructor() 
    {
        super();
        
        const vertices = CUBE_VERTICES_COMPLETE;
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
        // var EBO = new IndexBuffer(CUBE_INDICES);

        this.vertexArray = new VertexArray(VBO);
    }
};