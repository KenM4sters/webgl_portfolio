import App from "./Application.ts"

export var canvas = document.querySelector("#glcanvas") as HTMLCanvasElement | null;
if (canvas == null) throw new Error("#glcanvas cannot be found!");

export var gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
if (gl == null) throw new Error("webgl context is not available!");

const application = new App();
