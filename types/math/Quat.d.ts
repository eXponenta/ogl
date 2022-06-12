import { Euler } from './Euler.js';
import { WritableArrayLike } from './functions/Mat3Func.js';
import { Mat3 } from './Mat3.js';
import { Vec3 } from './Vec3.js';
export declare class Quat extends Array<number> {
    onChange: () => void;
    constructor(x?: number, y?: number, z?: number, w?: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set w(v: number);
    identity(): this;
    set(q: Quat): this;
    set(arr: Array<number>): this;
    set(x: number, y: number, z: number, w: number): this;
    rotateX(a: number): this;
    rotateY(a: number): this;
    rotateZ(a: number): this;
    inverse(q?: Quat): this;
    conjugate(q?: Quat): this;
    copy(q: Array<number>): this;
    clone(): Quat;
    normalize(q?: Quat): this;
    multiply(qA: Quat, qB?: Quat): this;
    dot(v: Quat): number;
    fromMatrix3(matrix3: Mat3): this;
    fromEuler(euler: Euler): this;
    fromAxisAngle(axis: Vec3, a: number): this;
    slerp(q: Quat, t: number): this;
    /**
     * Alias for Quat.slerp
     */
    lerp(q: Quat, t: number): this;
    fromArray(a: WritableArrayLike, o?: number): this;
    toArray(a?: WritableArrayLike, o?: number): WritableArrayLike;
}
