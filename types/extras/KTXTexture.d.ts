export class KTXTexture extends Texture<null> {
    constructor(gl: any, { buffer, wrapS, wrapT, anisotropy, minFilter, magFilter }?: {
        buffer: any;
        wrapS?: any;
        wrapT?: any;
        anisotropy?: number;
        minFilter: any;
        magFilter: any;
    });
    parseBuffer(buffer: any): void;
    image: {
        data: Uint8Array;
        width: number;
        height: number;
    }[];
    internalFormat: number;
}
import { Texture } from "../core/Texture.js";
