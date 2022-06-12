import { GLContext } from '../core/Renderer.js';
import { ICompressedImageData, Texture } from '../core/Texture.js';
export interface IKTXTextureInit {
    buffer: ArrayBuffer;
    wrapS: GLenum;
    wrapT: GLenum;
    anisotropy: number;
    minFilter: GLenum;
    magFilter: GLenum;
}
export declare class KTXTexture extends Texture<ICompressedImageData> {
    constructor(gl: GLContext, { buffer, wrapS, wrapT, anisotropy, minFilter, magFilter }?: Partial<IKTXTextureInit>);
    parseBuffer(buffer: ArrayBuffer): void;
}
