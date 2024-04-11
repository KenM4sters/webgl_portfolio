import {gl} from "./main.ts"
import Renderer from "./Renderer/Renderer.ts";
import { VertexBuffer, BufferAttribLayout, BufferAttribute, IndexBuffer } from "./Renderer/Buffer.ts";
import VertexArray from "./Renderer/VertexArray.ts";
import { Shader, ShaderDataType } from "./Renderer/Shader.ts";
import { BufferType, RenderCommand } from "./Renderer/RenderCommand.ts";

export default class App {
    constructor() 
    {
        this.InitTriangle();
        this.loop();
    }
    private renderer = new Renderer() as Renderer;
    private shader !: Shader;
    private VAO !: VertexArray;
    
    InitTriangle() : void
    {
        var vertices = new Float32Array([
            1.0,  1.0, 0.0,  0.0, 0.0, 1.0,   1.0, 1.0,  
            1.0, -1.0, 0.0,  0.0, 0.0, 1.0,   1.0, 0.0,   
            -1.0, -1.0, 0.0,  0.0, 0.0, 1.0,  0.0, 0.0,   
            -1.0,  1.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0  
        ]);

        var indices = new Uint16Array([
            0, 1, 3,   
            1, 2, 3 
        ]);

        this.shader = Shader.Create("vshader", "fshader", "TestShader");

        
        var elements : BufferAttribute[] = new Array<BufferAttribute>(
            new BufferAttribute(ShaderDataType.Float3, "aPosition"),
            new BufferAttribute(ShaderDataType.Float3, "aNormal"),
            new BufferAttribute(ShaderDataType.Float2, "aUV")
        );

        var layout : BufferAttribLayout = new BufferAttribLayout(elements);
        var VBO = new VertexBuffer(vertices);
        VBO.SetLayout(layout);

        
        var EBO = new IndexBuffer(indices);
        this.VAO = new VertexArray(VBO, EBO);

        gl.enable(gl.DEPTH_TEST);

    }

    DrawTriangle() : void
    {
        this.renderer.DrawVAO(this.VAO, this.shader);
    }
    
    loop() : void
    {
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.renderer.DrawVAO(this.VAO, this.shader);

        window.requestAnimationFrame(() => this.loop())
    }    
};