class Shader 
{
    constructor() 
    {
        Shader.Create();
    };

    static Create() : Shader 
    {
        
        return new Shader();
    }
};