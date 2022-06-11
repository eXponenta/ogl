import { WritableArrayLike } from './functions/Mat3Func.js';
import type { Mat3 } from './Mat3.js';
import type { Mat4 } from './Mat4.js';
export declare class Vec2 extends Array<number> {
    constructor(x?: number, y?: number);
    get x(): number;
    get y(): number;
    set x(v: number);
    set y(v: number);
    set(x: Array<number>): this;
    set(x: Vec2): this;
    set(x: number, y?: number): this;
    copy(v: Array<number>): this;
    copy(v: Vec2): this;
    clone(): Vec2;
    add(va: Vec2, vb?: Vec2): this;
    sub(va: Vec2, vb?: Vec2): this;
    multiply(v: Vec2 | number): this;
    divide(v: Vec2 | number): this;
    inverse(v?: this): this;
    len(): number;
    distance(v?: Vec2): number;
    squaredLen(): number;
    squaredDistance(v?: Vec2): number;
    negate(v?: Vec2): this;
    cross(va: Vec2, vb?: Vec2): number;
    scale(v: number): this;
    normalize(): Vec2;
    dot(v: Vec2): number;
    equals(v: Vec2): boolean;
    applyMatrix3(mat3: Mat3): this;
    applyMatrix4(mat4: Mat4): this;
    lerp(v: Vec2, a: number): this;
    fromArray(a: WritableArrayLike, o?: number): this;
    toArray(a?: WritableArrayLike, o?: number): WritableArrayLike;
}
