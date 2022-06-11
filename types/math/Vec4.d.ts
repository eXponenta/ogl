import type { WritableArrayLike } from './functions/Mat3Func.js';
export declare class Vec4 extends Array<number> {
    constructor(x?: number, y?: number, z?: number, w?: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get w(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set w(v: number);
    set(x: Array<number>): this;
    set(x: Vec4): this;
    set(x: number, y?: number, z?: number, w?: number): this;
    copy(v: Array<number>): this;
    clone(): Vec4;
    normalize(): this;
    multiply(v: number): this;
    dot(v: Vec4): number;
    fromArray(a: WritableArrayLike, o?: number): this;
    toArray(a?: WritableArrayLike, o?: number): WritableArrayLike;
}
