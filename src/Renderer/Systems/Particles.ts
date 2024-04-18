import { GeometryDrawFunction, GeometryDrawFunctionShapes, GeometryDrawFunctionTypes } from "../../Geometry";
import { AssetRegistry } from "../../Layers/AssetManager";
import { BufferAttribLayout, BufferAttribute, VertexBuffer } from "../Buffer";
import { BufferType, RenderCommand } from "../RenderCommand";
import {ShaderDataType } from "../Shader";
import VertexArray from "../VertexArray";
import { RenderSystem } from "./RenderSystem";


export class Particles extends RenderSystem 
{
    constructor(data : Float32Array, matKey : AssetRegistry, nInstances ?: number) 
    {
        super(data);
        this.materialKey = matKey;
        if(nInstances) this.nInstances = nInstances;
        else this.nInstances = data.length / 3;

        // Vertex Buffer
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
        );
        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        this.vertexBuffer.SetLayout(layout);
        
        // Vertex Array
        this.vertexArray = new VertexArray(this.vertexBuffer);
        RenderCommand.BindVertexArray(this.vertexArray.GetId());
        RenderCommand.BindBuffer(VertexBuffer.Id, BufferType.Vertex);
        for(const attrib of elements) 
        {
            RenderCommand.SetVertexArrayDivisor(elements.indexOf(attrib), 1);
            
        }
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Vertex);

        
    }

    public vertexArray !: VertexArray;
    public materialKey: AssetRegistry;
    public nInstances : number;
    public drawFunction : GeometryDrawFunction = 
    {
        type : GeometryDrawFunctionTypes.DRAW_ARRAYS,
        shape : GeometryDrawFunctionShapes.POINTS
    }
}