import type { Vec3 } from './Vec3.js';
import type { Mat4 } from './Mat4.js';
export declare class Mat3 extends Array<number> {
    constructor(m00?: number, m01?: number, m02?: number, m10?: number, m11?: number, m12?: number, m20?: number, m21?: number, m22?: number);
    set(mat: Mat3): this;
    set(array: Array<number>): this;
    set(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): this;
    translate(v: Vec3, m?: Mat3): this;
    rotate(v: number, m?: this): this;
    scale(v: Vec3, m?: this): this;
    multiply(ma: Mat3, mb?: Mat3): this;
    identity(): this;
    copy(m: Array<number>): this;
    fromMatrix4(m: Mat4): this;
    fromQuaternion(q: Array<number>): this;
    fromBasis(vec3a: Vec3, vec3b: Vec3, vec3c: Vec3): this;
    inverse(m?: this): this;
    getNormalMatrix(m: Mat4): this;
}
