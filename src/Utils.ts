export const LARGE_SQUARE_VERTCES_COMPLETE = new Float32Array([
    1.0,  1.0, 0.0,  0.0, 0.0, 1.0,  1.0, 1.0,  
    1.0, -1.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0,   
   -1.0, -1.0, 0.0,  0.0, 0.0, 1.0,  0.0, 0.0,   
   -1.0,  1.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0  
]);
export const SMALL_SQUARE_VERTCES_COMPLETE = new Float32Array([
    0.5,  0.5, 0.0,  0.0, 0.0, 1.0,  1.0, 1.0,  
    0.5, -0.5, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0,   
   -0.5, -0.5, 0.0,  0.0, 0.0, 1.0,  0.0, 0.0,   
   -0.5,  0.5, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0  
]);

export const SQUARE_INDICES = new Uint16Array([
    0, 1, 3,   
    1, 2, 3 
]);