import type { GLContext } from '../core/Renderer.js';
import { IBaseTextureInit, Texture } from '../core/Texture.js';
import { KTXTexture } from './KTXTexture.js';
export interface ITextureLoaderInit extends IBaseTextureInit {
    src: Record<string, string> | string;
}
export declare class TextureLoader {
    static load(gl: GLContext, { src, // string or object of extension:src key-values
    wrapS, wrapT, anisotropy, format, internalFormat, generateMipmaps, minFilter, magFilter, premultiplyAlpha, unpackAlignment, flipY, }?: Partial<ITextureLoaderInit>): any;
    static getSupportedExtensions(gl: any): string[];
    static loadKTX(src: string, texture: KTXTexture): Promise<void>;
    static loadImage(gl: GLContext, src: string, texture: Texture<ImageBitmap | HTMLImageElement>, flipY?: boolean): Promise<HTMLImageElement | ImageBitmap>;
    static clearCache(): void;
}
