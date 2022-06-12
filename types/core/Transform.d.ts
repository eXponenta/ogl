import { Vec3 } from '../math/Vec3.js';
import { Quat } from '../math/Quat.js';
import { Mat4 } from '../math/Mat4.js';
import { Euler } from '../math/Euler.js';
export declare class Transform {
    name?: string;
    zDepth: number;
    parent: Transform;
    readonly children: Transform[];
    visible: boolean;
    matrix: Mat4;
    worldMatrix: Mat4;
    matrixAutoUpdate: boolean;
    worldMatrixNeedsUpdate: boolean;
    readonly position: Vec3;
    readonly quaternion: Quat;
    readonly scale: Vec3;
    readonly rotation: Euler;
    readonly up: Vec3;
    constructor();
    setParent(parent: Transform, notifyParent?: boolean): void;
    addChild(child: Transform, notifyChild?: boolean): void;
    removeChild(child: Transform, notifyChild?: boolean): void;
    updateMatrixWorld(force?: boolean): void;
    updateMatrix(): void;
    traverse(callback: (node: Transform) => boolean): void;
    decompose(): void;
    lookAt(target: Vec3, invert?: boolean): void;
}
