import type { WritableArrayLike } from './functions/Mat3Func';
import * as Vec4Func from './functions/Vec4Func';

export class Vec4 extends Array<number> {
    constructor(x = 0, y = x, z = x, w = x) {
        super(x, y, z, w);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set z(v) {
        this[2] = v;
    }

    set w(v) {
        this[3] = v;
    }

    set(x: Array<number>): this;
    set(x: Vec4): this;
    set(x: number, y?: number, z?: number, w?: number): this;
    set(x, y?, z?, w?) {
        if (x.length) return this.copy(x);
        Vec4Func.set(this, x, y, z, w);
        return this;
    }

    copy(v: Array<number>): this;
    copy(v: Vec4) {
        Vec4Func.copy(this, v);
        return this;
    }

    normalize(): this {
        Vec4Func.normalize(this, this);
        return this;
    }

    multiply(v: number): this {
        Vec4Func.scale(this, this, v);
        return this;
    }

    dot(v: Vec4): number {
        return Vec4Func.dot(this, v);
    }

    fromArray(a: WritableArrayLike, o: number = 0): this {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        return this;
    }

    toArray(a: WritableArrayLike = [], o: number = 0): WritableArrayLike {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        return a;
    }
}
