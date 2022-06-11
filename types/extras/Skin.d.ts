export class Skin extends Mesh<import("../index.js").Geometry, import("../index.js").Program<"">> {
    constructor(gl: any, { rig, geometry, program, mode }?: {
        rig: any;
        geometry: any;
        program: any;
        mode?: any;
    });
    animations: any[];
    createBones(rig: any): void;
    root: Transform;
    bones: any[];
    createBoneTexture(): void;
    boneMatrices: Float32Array;
    boneTextureSize: number;
    boneTexture: Texture<import("../core/Texture.js").IImageSource>;
    addAnimation(data: any): Animation;
    update(): void;
    draw({ camera }?: {
        camera: any;
    }): void;
}
import { Mesh } from "../core/Mesh.js";
import { Transform } from "../core/Transform.js";
import { Texture } from "../core/Texture.js";
import { Animation } from "./Animation.js";
