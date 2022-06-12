import { Mesh } from '../core/Mesh.js';
import { Transform } from '../core/Transform.js';
import { Mat4 } from '../math/Mat4.js';
import { Animation } from './Animation.js';
import type { IAnimData } from './Animation.js';
import type { GLContext } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import type { Program } from '../core/Program.js';
export interface IBoneData {
    name: string;
    parent: number;
}
export interface IBindPose {
    position: Float32Array;
    quaternion: Float32Array;
    scale: Float32Array;
}
export interface IRigData {
    bones: IBoneData[];
    bindPose: IBindPose;
}
export interface ISkinInit {
    rig: IRigData;
    geometry: Geometry;
    program: Program;
    mode?: GLenum;
}
export interface IBoneTransform extends Transform {
    bindInverse: Mat4;
}
export declare class Skin extends Mesh<any, Program<'boneTexture' | 'boneTextureSize'>> {
    private boneTexture;
    private boneTextureSize;
    private animations;
    private boneMatrices;
    root: Transform;
    bones: IBoneTransform[];
    constructor(gl: GLContext, { rig, geometry, program, mode }: ISkinInit);
    createBones(rig: IRigData): void;
    createBoneTexture(): void;
    addAnimation(data: IAnimData): Animation;
    update(): void;
    draw({ camera }?: {
        camera?: any;
    }): void;
}
