import type { IDisposable } from "./IDisposable";
import type { GLContext } from "./Renderer.js";
import type { RenderState } from "./State.js";
export interface ICompressedImageFrame {
    width: number;
    height: number;
    data: Uint8Array;
}
export interface ICompressedImageData extends Array<ICompressedImageFrame> {
    isCompressedTexture: boolean;
}
export declare type INativeImageSource = HTMLCanvasElement | HTMLImageElement | ImageBitmap | HTMLVideoElement | null;
export declare type IImageSource = INativeImageSource | ICompressedImageData | Uint8Array | Float32Array | null;
export interface ITextureStyleInit {
    target: GLenum;
    type: GLenum;
    format: GLenum;
    internalFormat: GLenum;
    wrapS: GLenum;
    wrapT: GLenum;
    minFilter: GLenum;
    magFilter: GLenum;
    premultiplyAlpha: boolean;
    unpackAlignment: number;
}
export interface IBaseTextureInit extends ITextureStyleInit {
    generateMipmaps: boolean;
    flipY: boolean;
    anisotropy: number;
    level: number;
}
export interface IRegularTextureInit<T extends IImageSource> extends IBaseTextureInit {
    image: T;
}
export interface IEmptyTextureInit extends IBaseTextureInit {
    width: number;
    height: number;
}
export declare type ITextureInit<T extends IImageSource> = IRegularTextureInit<T> | IEmptyTextureInit;
export declare class Texture<T extends IImageSource = null> implements IDisposable {
    name?: string;
    image: T;
    readonly gl: GLContext;
    readonly id: number;
    readonly type: GLenum;
    readonly target: GLenum;
    readonly format: GLenum;
    readonly internalFormat: GLenum;
    readonly unpackAlignment: number;
    readonly store: {
        image: T;
    };
    readonly state: Partial<ITextureInit<T>>;
    readonly glState: RenderState;
    wrapS: GLenum;
    wrapT: GLenum;
    generateMipmaps: boolean;
    minFilter: GLenum;
    magFilter: GLenum;
    premultiplyAlpha: boolean;
    flipY: boolean;
    anisotropy: number;
    level: number;
    width: number;
    height: number;
    needsUpdate: boolean;
    texture: WebGLTexture;
    onUpdate?: () => void;
    constructor(gl: GLContext, { target, type, format, internalFormat, wrapS, wrapT, generateMipmaps, minFilter, magFilter, premultiplyAlpha, unpackAlignment, flipY, anisotropy, level, ...other }?: Partial<ITextureInit<T>>);
    bind(): void;
    update(textureUnit?: number): void;
    destroy(): void;
}
