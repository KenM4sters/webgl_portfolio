import { GeometryDrawFunction, GeometryDrawFunctionShapes, GeometryDrawFunctionTypes } from "../../Geometry";
import { SetInitialTransforms, Transforms } from "../../Mesh";
import { VertexBuffer } from "../Buffer";


export abstract class RenderSystem 
{
    constructor(data : Float32Array) 
    {
        this.vertexBuffer = new VertexBuffer(data);
    }

    public vertexBuffer : VertexBuffer;
    public drawFunction : GeometryDrawFunction = 
    {
        type: GeometryDrawFunctionTypes.DRAW_ARRAYS_INSTANCED, 
        shape: GeometryDrawFunctionShapes.POINTS
    }
    public transforms : Transforms = SetInitialTransforms(); 
};