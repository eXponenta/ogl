import { Mesh } from '../core/Mesh.js';
import type { GLContext, Renderer } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import type { Program } from '../core/Program.js';
import type { GLTFAnimation } from './GLTFAnimation.js';
import { Camera } from '../core/Camera.js';
export interface IGLTFSkeletoneData {
    joints: Array<any>;
}
export interface IGLTFSkinData {
    skeleton: IGLTFSkeletoneData;
    geometry: Geometry;
    program: Program;
    mode: GLenum;
}
export declare class GLTFSkin extends Mesh {
    readonly skeleton: IGLTFSkeletoneData;
    readonly animations: GLTFAnimation[];
    private boneMatrices;
    private boneTextureSize;
    private boneTexture;
    constructor(gl: GLContext, { skeleton, geometry, program, mode }: IGLTFSkinData);
    createBoneTexture(): void;
    updateUniforms(): void;
    prepare(args: {
        camera: Camera;
        context: Renderer;
    }): void;
    draw({ camera, context }: {
        camera?: any;
        context: any;
    }): void;
}
