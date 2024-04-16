import * as glm from "gl-matrix";
import { Geometry } from "./Geometry";
import { AssetRegistry } from "./Layers/AssetManager";


export enum GeometryType 
{
    SQUARE,
    CUBE
}

export interface Transforms 
{
    Translation : glm.vec3;
    Scale : glm.vec3;
    Rotation : glm.quat;
    ModelMatrix : glm.mat4;
}

export function SetInitialTransforms() : Transforms
{
    return {        
        Translation: [0.0, 0.0, 0.0],
        Scale: [1.0, 1.0, 1.0],
        Rotation: [0.0, 0.0, 0.0, 0.0],
        ModelMatrix: glm.mat4.create()
    };
}

export class Mesh 
{
    constructor(geo : Geometry, matKey : AssetRegistry) 
    {
        this.geometry = geo;
        this.materialKey = matKey; 
    }

    // Getters
    GetGeometry() : Geometry { return this.geometry; }
    GetMaterialKey() : AssetRegistry { return this.materialKey; }
    GetTransforms() : Transforms { return this.transforms; }

    public materialKey : AssetRegistry;
    public geometry : Geometry;
    public transforms : Transforms = SetInitialTransforms();
 
};