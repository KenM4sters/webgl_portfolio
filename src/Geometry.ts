import { gl } from "./App";
import { BufferAttribLayout, BufferAttribute, IndexBuffer, VertexBuffer } from "./Renderer/Buffer";
import { ShaderDataType } from "./Renderer/Shader";
import VertexArray from "./Renderer/VertexArray";
import { CUBE_INDICES, CUBE_VERTICES_COMPLETE, LARGE_SQUARE_VERTCES_COMPLETE, SQUARE_INDICES } from "./Utils";

export enum GeometryDrawFunctionTypes 
{
    DRAW_ARRAYS,
    DRAW_ARRAYS_INDEXED,
    DRAW_ARRAYS_INSTANCED,
};

export enum GeometryDrawFunctionShapes 
{
    TRIANGLES,
    TRIANGLES_STRIP,
    LINES,
    POINTS
};

export interface GeometryDrawFunction 
{
    type  : GeometryDrawFunctionTypes,
    shape : GeometryDrawFunctionShapes
}

export abstract class Geometry 
{
    constructor() {}

    public vertexArray !: VertexArray;
    public drawFunction : GeometryDrawFunction = 
    {
        type : GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED,
        shape : GeometryDrawFunctionShapes.TRIANGLES
    }
};


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

export class SphereGeometry extends Geometry
{
    constructor(radius : number, wSegements : number, hSegements : number) 
    {
        super();
        
        const vertices = GenerateSphereVertices(radius, wSegements, hSegements);
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);
        // var EBO = new IndexBuffer(CUBE_INDICES);

        this.vertexArray = new VertexArray(VBO);
    }
};


function GenerateSphereVertices(radius : number, wSegments : number, hSegments : number ) : Float32Array 
{
    var vertices : Array<number> = new Array<number>();
    for (let lat = 0; lat < wSegments; lat++) {
        const theta = lat * Math.PI / wSegments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        for (let long = 0; long < hSegments; long++) {
            const phi = long * 2 * Math.PI / hSegments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
    
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            vertices.push(radius * x, radius * y, radius * z);
        }
    }

    var vert = new Float32Array(wSegments*hSegments*3);
    vert.set(vertices, 0);
    return vert;
};


export function ConvertShapeToNativeShape(shape : GeometryDrawFunctionShapes) : number 
{
    switch(shape) 
    { 
        case GeometryDrawFunctionShapes.TRIANGLES: return gl.TRIANGLES;
        case GeometryDrawFunctionShapes.TRIANGLES_STRIP: return gl.TRIANGLE_STRIP;
        case GeometryDrawFunctionShapes.POINTS: return gl.POINTS;
        case GeometryDrawFunctionShapes.LINES: return gl.LINES;
    }

    return 0;
}