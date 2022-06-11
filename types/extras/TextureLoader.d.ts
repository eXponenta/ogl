export class TextureLoader {
    static load(gl: any, { src, wrapS, wrapT, anisotropy, format, internalFormat, generateMipmaps, minFilter, magFilter, premultiplyAlpha, unpackAlignment, flipY, }?: {
        src: any;
        wrapS?: any;
        wrapT?: any;
        anisotropy?: number;
        format?: any;
        internalFormat?: any;
        generateMipmaps?: boolean;
        minFilter?: any;
        magFilter?: any;
        premultiplyAlpha?: boolean;
        unpackAlignment?: number;
        flipY?: boolean;
    }): any;
    static getSupportedExtensions(gl: any): any[];
    static loadKTX(src: any, texture: any): Promise<any>;
    static loadImage(gl: any, src: any, texture: any, flipY: any): Promise<any>;
    static clearCache(): void;
}
