import { Transform } from './Transform.js';
import { Mat4 } from '../math/Mat4.js';
import { Vec3 } from '../math/Vec3.js';
export interface IBaseCameraInti {
    near: number;
    far: number;
}
export interface IOrhoCameraInit extends IBaseCameraInti {
    left: number;
    right: number;
    bottom: number;
    top: number;
    zoom: number;
}
export interface IPerspectiveCameraInit extends IBaseCameraInti {
    fov: number;
    aspect: number;
}
export declare type ICamera = Partial<IOrhoCameraInit & IPerspectiveCameraInit> & {
    type: 'orthographic' | 'perspective';
};
export declare class Camera extends Transform implements ICamera {
    readonly projectionMatrix: Mat4;
    readonly viewMatrix: Mat4;
    readonly projectionViewMatrix: Mat4;
    readonly worldPosition: Vec3;
    frustum: Array<Vec3 & {
        constant?: number;
    }>;
    type: 'orthographic' | 'perspective';
    near?: number;
    far?: number;
    fov?: number;
    aspect?: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    zoom?: number;
    constructor(_gl: any, { near, far, fov, aspect, left, right, bottom, top, zoom }?: Partial<IOrhoCameraInit & IPerspectiveCameraInit>);
    perspective({ near, far, fov, aspect }?: {
        near?: number;
        far?: number;
        fov?: number;
        aspect?: number;
    }): this;
    orthographic({ near, far, left, right, bottom, top, zoom, }?: {
        near?: number;
        far?: number;
        left?: number;
        right?: number;
        bottom?: number;
        top?: number;
        zoom?: number;
    }): this;
    updateMatrixWorld(): this;
    lookAt(target: Vec3): this;
    project(v: Vec3): this;
    unproject(v: Vec3): this;
    updateFrustum(): void;
    frustumIntersectsMesh(node: any): boolean;
    frustumIntersectsSphere(center: Vec3, radius: number): boolean;
}
