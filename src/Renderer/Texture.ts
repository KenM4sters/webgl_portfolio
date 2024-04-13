import { gl } from "../App.ts";
import { Id } from "./Buffer.ts";
import { RenderCommand } from "./RenderCommand";
import { ConvertShaderTypeToNative, ShaderDataType } from "./Shader.ts";

export class TexData<T> 
{
    constructor(public val : T) {}

}

export enum TextureType 
{
    Tex2D,
    CubeTex 
}

export enum ImageChannels 
{
    RGB,
    RGBA 
}


export interface ImageConfig {
    TargetType : TextureType;
    MipMapLevel : number;
    NChannels : ImageChannels;
    Width : number;
    Height : number;
    Format : ImageChannels;
    DataType : ShaderDataType;
};


// Abstract Texture class to serve as a base for other classes such as the Texture2D and CubeTexture
// classes.
abstract class Texture 
{
    constructor(config : ImageConfig, data : Uint8Array | null = null) 
    {
        this.config = config;
        this.data.val = data
        this.Init();
    }

    protected Id : Id<WebGLTexture | null> = {val: null};
    protected config : ImageConfig;
    protected data : TexData<Uint8Array | HTMLImageElement | null> = {val: null};

    abstract Init() : void;
    abstract LoadImage(filepath : string) : void;

    // Getters
    GetId() : Id<WebGLTexture | null> { return this.Id; }
    GetConfig() : ImageConfig { return this.config; }
    GetData() : TexData<Uint8Array | HTMLImageElement | null> { return this.data; }

    // Setters
    SetConfig(config : ImageConfig) : void { this.config = config;  }
    SetData(texData : TexData<Uint8Array | HTMLImageElement | null>) : void { this.data = texData}
    
};

// Main texture class that stores data generated either by the user manually or from an Image
// that can be loaded via the LoadImage() method.
export class Texture2D extends Texture 
{
    constructor(config : ImageConfig, data : Uint8Array | null = null) 
    {
        super(config, data);
    }

    override Init() : void 
    {
        this.Id = {val: RenderCommand.CreateTexture()};
        RenderCommand.BindTexture(this.Id, TextureType.Tex2D, 0);
        RenderCommand.SetTexture2DArray(this.config, this.data as TexData<Uint8Array | null>);
    }

    // Loads an Image object from a given filepath and sets the member data variable to the image object.
    override LoadImage(filepath : string) : void 
    {
        var image = new Image();
        image.src = filepath;
        image.addEventListener("load", () => {
            RenderCommand.BindTexture(this.Id, TextureType.Tex2D, 0);
            RenderCommand.SetTexture2DImage(this.config, image);
            RenderCommand.GenerateMipMap(TextureType.Tex2D);
            RenderCommand.UnBindTexture(TextureType.Tex2D, 0);

            this.data.val = image;
            this.config.Width = image.width;
            this.config.Height = image.height;
        })
    }

    // This function is meant to be called whenever you want to instantiate a new instance of the 
    // class, but it's just a personal preference/habbit for me from C++, so of course you can just
    // manually create an instance with the new keyword and not bother calling Create().
    static Create(config : ImageConfig, data : Uint8Array | null = null) : Texture2D 
    {
        return new Texture2D(config, data);
    }
};



// Not needed yet - Work In Progress.
export class CubeTexture extends Texture 
{
    constructor(config : ImageConfig) 
    {
        super(config);
    }

    override Init() : void {}
    override LoadImage(): void {}
};


export function ConvertTextureTypeToNative(type : TextureType) : number 
{
    switch(type) 
    {
        case TextureType.Tex2D: return gl.TEXTURE_2D;
        case TextureType.CubeTex: return gl.TEXTURE_CUBE_MAP;
    }

    return 0;
}

export function ConvertImageChannelsToNative(type : ImageChannels) : number 
{
    switch(type) 
    {
        case ImageChannels.RGB: return gl.RGB;
        case ImageChannels.RGBA: return gl.RGBA;
    }

    return 0;
}