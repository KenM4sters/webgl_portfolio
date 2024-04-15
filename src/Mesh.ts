import * as glm from "gl-matrix";
import { Geometry } from "./Geometry";


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
    constructor(geo : Geometry, matIndex : number) 
    {
        this.geometry = geo;
        this.materialIndex = matIndex; 
    }

    // Getters
    GetGeometry() : Geometry { return this.geometry; }
    GetMaterialIndex() : number { return this.materialIndex; }
    GetTransforms() : Transforms { return this.transforms; }

    public materialIndex : number = 0;
    public geometry : Geometry;
    public transforms : Transforms = SetInitialTransforms();
 
};