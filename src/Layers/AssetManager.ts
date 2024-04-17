import * as glm from "gl-matrix";
import { Material, PhysicalMaterial, RenderPassMaterial } from "../Material";
import { Shader, ShaderDataType } from "../Renderer/Shader";

// Shaders
import fullscreenQuadVertSource from "../Shaders/FULL_SCREEN_QUAD.vert?raw";
import hdrFragSource from "../Shaders/HDR.frag?raw";
import mvpVertSource from "../Shaders/MVP.vert?raw";
import phongFragSource from "../Shaders/PHONG.frag?raw";
import pbrFragSource from "../Shaders/PBR.frag?raw";
import downsampleFragSource from "../Shaders/DOWNSAMPLING.frag?raw";
import upsampleFragSource from "../Shaders/UPSAMPLING.frag?raw";
import { CubeGeometry, Geometry, SquareGeometry } from "../Geometry";


export enum AssetRegistry 
{
    GEO_SQUARE = "GEO_SQUARE",
    GEO_CUBE = "GEO_CUBE",
    MAT_PHONG = "MAT_PHONG",
    MAT_PBR = "MAT_PBR",
    MAT_HDR = "MAT_HDR",
    MAT_DOWNSAMPLE = "MAT_DOWNSAMPLE",
    MAT_UPSAMPLE = "MAT_UPSAMPLE"    
};

export default class AssetManager 
{
    constructor() {}

    public static LoadAllAssets() 
    {
        // Shaders
        var PHONG_SHADER = Shader.Create(mvpVertSource, phongFragSource, "PHONG_SHADER");
        var PBR_SHADER = Shader.Create(mvpVertSource, pbrFragSource, "PBR_SHADER");
        var HDR_SHADER = Shader.Create(fullscreenQuadVertSource, hdrFragSource, "HDR_SHADER");
        var DOWNSAMPLE_SHADER = Shader.Create(fullscreenQuadVertSource, downsampleFragSource, "HDR_SHADER");
        var UPSAMPLE_SHADER = Shader.Create(fullscreenQuadVertSource, upsampleFragSource, "HDR_SHADER");

        // Materials
        var PHONG_MAT = new PhysicalMaterial(PHONG_SHADER);
        PHONG_MAT.Albedo.val = glm.vec3.fromValues(1.0, 1.0, 1.0);
        var PBR_MAT = new PhysicalMaterial(PBR_SHADER);
        PBR_MAT.Albedo.val = glm.vec3.fromValues(1.0, 0.8, 0.6);
        AssetManager.materials.set(AssetRegistry.MAT_PHONG, PHONG_MAT);
        AssetManager.materials.set(AssetRegistry.MAT_PBR, PBR_MAT);
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