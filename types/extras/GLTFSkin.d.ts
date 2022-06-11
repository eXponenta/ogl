export class GLTFSkin extends Mesh<import("../index.js").Geometry, import("../index.js").Program<"">> {
    constructor(gl: any, { skeleton, geometry, program, mode }?: {
        skeleton: any;
        geometry: any;
        program: any;
        mode?: any;
    });
    skeleton: any;
    program: any;
    animations: any[];
    createBoneTexture(): void;
    boneMatrices: Float32Array;
    boneTextureSize: number;
    boneTexture: Texture<import("../core/Texture.js").IImageSource>;
    updateUniforms(): void;
    draw({ camera }?: {
        camera: any;
    }): void;
    worldMatrix: any;
}
import { Mesh } from "../core/Mesh.js";
import { Texture } from "../core/Texture.js";
