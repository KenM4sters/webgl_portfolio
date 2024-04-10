class App {
    constructor() 
    {
        this.Init();
        this.Triangle();
        this.loop();
    }

    canvas : any;
    gl : any;
    isRunning : boolean = true;
    vao : WebGLVertexArrayObject = {};
    ebo : WebGLBuffer = {};
    vbo : WebGLBuffer = {};

    
    Init() : void
    {
        this.canvas = document.querySelector("#glcanvas") as HTMLCanvasElement | null;
        if (this.canvas == null) throw new Error("");

        this.gl = this.canvas.getContext("webgl") as WebGLRenderingContext | null;
        // Only continue if WebGL is available and working
        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }
    }

    Triangle() : void
    {
        this.gl.createBuffer();
    }

    loop() : void
    {
        // Set clear color to black, fully opaque
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        // Clear the color buffer with specified clear color
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }    
};


const application = new App();
