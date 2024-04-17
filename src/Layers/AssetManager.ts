import * as glm from "gl-matrix";
import { Material, PhysicalMaterial, RenderPassMaterial } from "../Material";
import { Shader, ShaderDataType } from "../Renderer/Shader";

// Shaders
import fullscreenQuadVertSource from "../Shaders/FULL_SCREEN_QUAD.vert?raw";
import hdrFragSource from "../Shaders/HDR.frag?raw";
import mvpVertSource from "../Shaders/MVP.vert?raw";
import phongFragSource from "../Shaders/PHONG.frag?raw";
import pbrFragSource from "../Shaders/PBR.frag?raw";
import skyFragSource from "../Shaders/SKY.frag?raw";
import downsampleFragSource from "../Shaders/DOWNSAMPLING.frag?raw";
import upsampleFragSource from "../Shaders/UPSAMPLING.frag?raw";
import { CubeGeometry, Geometry, SphereGeometry, SquareGeometry } from "../Geometry";


export enum AssetRegistry 
{
    GEO_SQUARE = "GEO_SQUARE",
    GEO_CUBE = "GEO_CUBE",
    GEO_SPHERE = "GEO_SPHERE",
    MAT_CUBE = "MAT_CUBE",
    MAT_FLOOR = "MAT_FLOOR",
    MAT_HDR = "MAT_HDR",
    MAT_DOWNSAMPLE = "MAT_DOWNSAMPLE",
    MAT_UPSAMPLE = "MAT_UPSAMPLE",
    MAT_SKY = "MAT_SKY"    
};

export default class AssetManager 
{
    constructor() {}

    public static LoadAllAssets() 
    {
        // Shaders
        var PHONG_SHADER = Shader.Create(mvpVertSource, phongFragSource, "PHONG_SHADER");
        var PBR_SHADER = Shader.Create(mvpVertSource, pbrFragSource, "PBR_SHADER");
        var SKY_SHADER = Shader.Create(mvpVertSource, skyFragSource, "SKY_SHADER");
        var HDR_SHADER = Shader.Create(fullscreenQuadVertSource, hdrFragSource, "HDR_SHADER");
        var DOWNSAMPLE_SHADER = Shader.Create(fullscreenQuadVertSource, downsampleFragSource, "HDR_SHADER");
        var UPSAMPLE_SHADER = Shader.Create(fullscreenQuadVertSource, upsampleFragSource, "HDR_SHADER");

        // Materials
        var CUBE_MAT = new PhysicalMaterial(PBR_SHADER);
        CUBE_MAT.Albedo.val = glm.vec3.fromValues(1.0, 0.8, 0.6);

        var FLOOR_MAT = new PhysicalMaterial(PBR_SHADER);
        FLOOR_MAT.Albedo.val = glm.vec3.fromValues(1.0, 0.8, 0.6);

        var SKY_MAT = new PhysicalMaterial(SKY_SHADER);

        AssetManager.materials.set(AssetRegistry.MAT_CUBE, CUBE_MAT);
        AssetManager.materials.set(AssetRegistry.MAT_FLOOR, FLOOR_MAT);
        AssetManager.materials.set(AssetRegistry.MAT_SKY, SKY_MAT);
        AssetManager.materials.set(AssetRegistry.MAT_HDR, new RenderPassMaterial(HDR_SHADER));
        AssetManager.materials.set(AssetRegistry.MAT_DOWNSAMPLE, new RenderPassMaterial(DOWNSAMPLE_SHADER));
        AssetManager.materials.set(AssetRegistry.MAT_UPSAMPLE, new RenderPassMaterial(UPSAMPLE_SHADER));

        // Geometries
        AssetManager.geometries.set(AssetRegistry.GEO_SQUARE, new SquareGeometry());
        AssetManager.geometries.set(AssetRegistry.GEO_CUBE, new CubeGeometry());
    }

    public static materials  : Map<AssetRegistry, Material>  = new Map<AssetRegistry, Material>();
    public static geometries : Map<AssetRegistry, Geometry>  = new Map<AssetRegistry, Geometry>();
}