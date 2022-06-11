import type { Vec3 } from './Vec3.js';
import type { Quat } from './Quat.js';
import type { WritableArrayLike } from './functions/Mat3Func.js';
export declare class Mat4 extends Array<number> {
    constructor(m00?: number, m01?: number, m02?: number, m03?: number, m10?: number, m11?: number, m12?: number, m13?: number, m20?: number, m21?: number, m22?: number, m23?: number, m30?: number, m31?: number, m32?: number, m33?: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set w(v: number);
    set(mat: Mat4): this;
    set(array: Array<number>): this;
    set(m00: any, m01: any, m02: any, m03: any, m10: any, m11: any, m12: any, m13: any, m20: any, m21: any, m22: any, m23: any, m30: any, m31: any, m32: any, m33: any): this;
    translate(v: Vec3, m?: this): this;
    rotate(v: number, axis: Vec3, m?: this): this;
    scale(v: number, m?: Mat4): this;
    multiply(ma: Mat4, mb: Mat4): this;
    identity(): this;
    copy(m: Array<number>): this;
    fromPerspective({ fov, aspect, near, far }: {
        fov: number;
        aspect: number;
        near: number;
        far: number;
    }): this;
    fromOrthogonal({ left, right, bottom, top, near, far }: {
        left: number;
        right: number;
        bottom: number;
        top: number;
        near: number;
        far: number;
    }): this;
    fromQuaternion(q: Quat): this;
    setPosition(v: Vec3): this;
    inverse(m?: Mat4): this;
    compose(q: Quat, pos: Vec3, scale: Vec3): this;
    getRotation(q: Quat): this;
    getTranslation(pos: Vec3): this;
    getScaling(scale: Vec3): this;
    getMaxScaleOnAxis(): number;
    lookAt(eye: Vec3, target: Vec3, up: Vec3): this;
    determinant(): number;
    fromArray(a: WritableArrayLike, o?: number): this;
    toArray(a?: WritableArrayLike, o?: number): WritableArrayLike;
}
