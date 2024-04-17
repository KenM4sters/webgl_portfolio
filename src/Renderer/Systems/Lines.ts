import { GeometryDrawFunction, GeometryDrawFunctionShapes, GeometryDrawFunctionTypes } from "../../Geometry";
import { BufferAttribLayout, BufferAttribute, VertexBuffer } from "../Buffer";
import { RenderCommand } from "../RenderCommand";
import { ShaderDataType } from "../Shader";
import VertexArray from "../VertexArray";
import { RenderSystem } from "./RenderSystem";


export class Lines extends RenderSystem 
{
    constructor(data : Float32Array, startPos : number, endPos : number, nInstances ?: number) 
    {
        super(data);
        if(nInstances) this.nInstances = nInstances;
        else this.nInstances = data.length / 6;

        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aColor"),
        );
        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        this.vertexBuffer.SetLayout(layout);
        
        this.vertexArray = new VertexArray(this.vertexBuffer);
        var layoutLoc = 0;

        RenderCommand.BindVertexArray(this.vertexArray.GetId());
        for(const attrib of elements) 
        {
            RenderCommand.SetVertexArrayDivisor(elements.indexOf(attrib), 1);
            
        }
        RenderCommand.UnbindVertexArray();
    }

    public vertexArray !: VertexArray;
    public nInstances : number;
    public drawFunction : GeometryDrawFunction = 
    {
        type : GeometryDrawFunctionTypes.DRAW_ARRAYS_INDEXED,
        shape : GeometryDrawFunctionShapes.TRIANGLES
    }
}