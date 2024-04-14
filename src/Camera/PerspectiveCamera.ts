import {SCREEN_HEIGHT, SCREEN_WIDTH, gl} from "../App.ts";
import * as glm from "gl-matrix";

export enum CameraDirections  
{

}

export default class PerspectiveCamera 
{
    constructor(pos : glm.vec3) 
    {
        this.position = pos;
        this.UpdateProjectionMatrix();
        this.UpdateViewMatrix();
    }

    public UpdateViewMatrix() : void 
    {
        glm.mat4.lookAt(this.viewMatrix, this.position, this.front, this.up);
    }

    public UpdateProjectionMatrix() : void 
    {
        glm.mat4.perspective(this.projectionMatrix, glm.glMatrix.toRadian(this.fov), SCREEN_WIDTH/SCREEN_WIDTH, 0.1, 1000);
    }

    // Getters.
    public GetProjectionMatrix() : glm.mat4 { return this.projectionMatrix; }
    public GetViewMatrix() : glm.mat4 { return this.viewMatrix; }

    public ResetFOV(fov : number) : void { this.fov = fov; this.UpdateProjectionMatrix(); }



    public position : glm.vec3;
    
    private front : glm.vec3 = [0.0, 0.0, -1.0];
    private up : glm.vec3 = [0.0, 1.0, 0.0];
    private fov : number = 45;

    private projectionMatrix : glm.mat4 = glm.mat4.create();
    private viewMatrix : glm.mat4 = glm.mat4.create();
};