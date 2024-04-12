import { gl } from "./App";
import PerspectiveCamera from "./Camera/PerspectiveCamera";
import { Light } from "./Light"
import { Mesh } from "./Mesh"
import RenderLayer from "./RenderLayer";
import { BufferAttribLayout, BufferAttribute, IndexBuffer, VertexBuffer } from "./Renderer/Buffer";
import { Shader, ShaderDataType } from "./Renderer/Shader";
import VertexArray from "./Renderer/VertexArray";

export default class Scene extends RenderLayer
{
    constructor(camera : PerspectiveCamera) {
        super();
        this.camera = camera;
        this.Prepare();
    }
    private shader !: Shader;
    private VAO !: VertexArray;

    Prepare() 
    {
        var vertices = new Float32Array([
            0.5,  0.5, 0.0,  0.0, 0.0, 1.0,   1.0, 1.0,  
            0.5, -0.5, 0.0,  0.0, 0.0, 1.0,   1.0, 0.0,   
            -0.5, -0.5, 0.0,  0.0, 0.0, 1.0,  0.0, 0.0,   
            -0.5,  0.5, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0  
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

    loop() : void
    {
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.renderer.DrawVAO(this.VAO, this.shader);
        window.requestAnimationFrame(() => this.loop())
    } 


    

    Push(obj : Mesh | Light) : void 
    {
        this.sceneObjects.push(obj);
    }

    Traverse(callback: (child : Mesh | Light) => {}) 
    {
        for(const obj of this.sceneObjects) 
        {
            callback(obj);
        }
    }

    public sceneObjects : Array<Mesh | Light> = new Array<Mesh | Light>();
    public camera : PerspectiveCamera;

};