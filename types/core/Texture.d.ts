import { GLContext, INativeObjectHolder, Renderer } from "./Renderer.js";
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
export declare class Texture<T extends IImageSource = null> implements INativeObjectHolder {
    name?: string;
    image: T;
    /**
     * @deprecated
     * GL not stored, use activeContext after prepare call
     */
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
    textureUnit: number;
    texture: WebGLTexture;
    activeContext: Renderer;
    onUpdate?: () => void;
    constructor(_gl: GLContext, { target, type, format, internalFormat, wrapS, wrapT, generateMipmaps, minFilter, magFilter, premultiplyAlpha, unpackAlignment, flipY, anisotropy, level, ...other }?: Partial<ITextureInit<T>>);
    /**
     * Attach renderer context to current texture and prepare (bind, upload) for rendering
     * @returns
     */
    prepare({ context }: {
        context: Renderer;
    }): void;
    /**
     * Bind texture to slot, not prepare it. Only bind. For prepare use prepare
     */
    bind(textureUnit?: number): void;
    setSize(width: number, height: number): void;
    /**
     * @deprecated
     * Only mark, not force upload.
     * Use prepare for direct upload and bind for bind
     */
    update(textureUnit?: number): void;
    private upload;
    destroy(): void;
}
