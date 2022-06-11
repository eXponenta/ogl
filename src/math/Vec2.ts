import { WritableArrayLike } from './functions/Mat3Func';
import * as Vec2Func from './functions/Vec2Func';
import type { Mat3 } from './Mat3';
import type { Mat4 } from './Mat4';

export class Vec2 extends Array<number> {
    constructor(x = 0, y = x) {
        super(x, y);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set(x: Array<number>): this;
    set(x: Vec2): this;
    set(x: number, y?: number): this
    set(x, y = x) {
        if (x.length) return this.copy(x);
        Vec2Func.set(this, x, y);
        return this;
    }

    copy(v: Array<number>): this;
    copy(v: Vec2): this;
    copy(v) {
        Vec2Func.copy(this, v);
        return this;
    }

    add(va: Vec2, vb?: Vec2): this {
        if (vb) Vec2Func.add(this, va, vb);
        else Vec2Func.add(this, this, va);
        return this;
    }

    sub(va: Vec2, vb?: Vec2): this {
        if (vb) Vec2Func.subtract(this, va, vb);
        else Vec2Func.subtract(this, this, va);
        return this;
    }

    multiply(v: Vec2 | number): this {
        if (typeof v !== 'number') Vec2Func.multiply(this, this, v);
        else Vec2Func.scale(this, this, v);
        return this;
    }

    divide(v: Vec2 | number): this {
        if (typeof v !== 'number') Vec2Func.divide(this, this, v);
        else Vec2Func.scale(this, this, 1 / v);
        return this;
    }

    inverse(v = this): this {
        Vec2Func.inverse(this, v);
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len(): number {
        return Vec2Func.length(this);
    }

    distance(v?: Vec2): number {
        if (v) return Vec2Func.distance(this, v);
        else return Vec2Func.length(this);
    }

    squaredLen(): number {
        return this.squaredDistance();
    }

    squaredDistance(v?: Vec2): number {
        if (v) return Vec2Func.squaredDistance(this, v);
        else return Vec2Func.squaredLength(this);
    }

    negate(v: Vec2 = this): this {
        Vec2Func.negate(this, v);
        return this;
    }

    cross(va: Vec2, vb?: Vec2): number {
        if (vb) return Vec2Func.cross(va, vb);
        return Vec2Func.cross(this, va);
    }

    scale(v: number): this {
        Vec2Func.scale(this, this, v);
        return this;
    }

    normalize(): Vec2 {
        Vec2Func.normalize(this, this);
        return this;
    }

    dot(v: Vec2): number {
        return Vec2Func.dot(this, v);
    }

    equals(v: Vec2): boolean {
        return Vec2Func.exactEquals(this, v);
    }

    applyMatrix3(mat3: Mat3): this {
        Vec2Func.transformMat3(this, this, mat3);
        return this;
    }

    applyMatrix4(mat4: Mat4): this {
        Vec2Func.transformMat4(this, this, mat4);
        return this;
    }

    lerp(v: Vec2, a: number): this {
        Vec2Func.lerp(this, this, v, a);
        return this;
    }

    clone(): Vec2 {
        return new Vec2(this[0], this[1]);
    }

    fromArray(a: WritableArrayLike, o: number = 0): this {
        this[0] = a[o];
        this[1] = a[o + 1];
        return this;
    }

    toArray(a: WritableArrayLike = [], o: number = 0): WritableArrayLike {
        a[o] = this[0];
        a[o + 1] = this[1];
        return a;
    }
}
