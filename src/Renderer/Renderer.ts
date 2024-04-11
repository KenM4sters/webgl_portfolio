import { IndexBuffer, VertexBuffer } from "./Buffer";
import { BufferType, RenderCommand } from "./RenderCommand";
import { Shader } from "./Shader";
import { gl } from "../main";
import VertexArray from "./VertexArray";

export default class Renderer 
{
    constructor() {}

    DrawMesh() : void {}

    DrawVAO(VAO : VertexArray, shader : Shader) : void {
        // Bind the vertex array object and shader program.
        RenderCommand.BindVertexArray(VAO.GetId());
        RenderCommand.UseShader(shader.GetId() as WebGLProgram);


        // Only call DrawIndexed() if the index buffer isn't null.
        var EBO = VAO.GetIndexBuffer();
        if(EBO && IndexBuffer.Id) 
        {
            RenderCommand.BindBuffer(IndexBuffer.Id, BufferType.Index)
            // console.log(IndexBuffer.cachedSize);
            // console.log(gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE));
            RenderCommand.DrawIndexed(EBO.GetUniqueSize(), EBO.GetUniqueOffset());
        } else {
            RenderCommand.Draw(6);
        }

        // Cleanup.
        RenderCommand.UnbindVertexArray();
        RenderCommand.UnbindBuffer(BufferType.Index);
    }

    PrepareScene() : void {}
    RenderScene() : void {}

};