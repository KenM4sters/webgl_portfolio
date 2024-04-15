import * as glm from "gl-matrix";
import { Material, PhysicalMaterial } from "../Material";
import { Shader, ShaderDataType } from "../Renderer/Shader";

// Shaders
import screenQuadVertSource from "../Shaders/SCREEN_QUAD_SHADER.vert?raw";
import screenQuadFragSource from "../Shaders/SCREEN_QUAD_SHADER.frag?raw";
import basicVertSource from "../Shaders/BASIC_SHADER.vert?raw";
import basicFragSource from "../Shaders/BASIC_SHADER.frag?raw";
import { CubeGeometry, Geometry, SquareGeometry } from "../Geometry";

export default class AssetManager 
{
    constructor() {}

    public static LoadAllAssets() 
    {
        // Shaders
        var BASIC_SHADER = Shader.Create(basicVertSource, basicFragSource, "BASIC_SHADER");
        var SCREEN_QUAD_SHADER = Shader.Create(screenQuadVertSource, screenQuadFragSource, "SCREEN_QUAD_SHADER");

        // Materials
        AssetManager.materials.push(new PhysicalMaterial(BASIC_SHADER));
        AssetManager.materials.push(new PhysicalMaterial(SCREEN_QUAD_SHADER));

        // Geometries
        var SQUARE_GEOMETRY = AssetManager.geometries["SQUARE"] = new SquareGeometry(); 
        var CUBE_GEOMETRY = AssetManager.geometries["CUBE"] = new CubeGeometry(); 
    }

    public static materials : Array<Material> = new Array<Material>();
    public static geometries : {[key : string]: Geometry} = {};
}