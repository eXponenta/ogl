import { Euler } from './Euler.js';
import { WritableArrayLike } from './functions/Mat3Func.js';
import * as QuatFunc from './functions/QuatFunc.js';
import { Mat3 } from './Mat3.js';
import { Vec3 } from './Vec3.js';

export class Quat extends Array<number> {
    onChange: () => void;

    constructor(x = 0, y = 0, z = 0, w = 1) {
        super(x, y, z, w);
        this.onChange = () => {};
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

    set x(v: number) {
        this[0] = v;
        this.onChange();
    }

    set y(v: number) {
        this[1] = v;
        this.onChange();
    }

    set z(v: number) {
        this[2] = v;
        this.onChange();
    }

    set w(v: number) {
        this[3] = v;
        this.onChange();
    }

    identity(): this {
        QuatFunc.identity(this);
        this.onChange();
        return this;
    }

    set(q: Quat): this
    set(arr: Array<number>): this
    set(x: number, y: number, z: number, w: number): this;
    set(x, y?, z?, w?) {
        if (x.length) return this.copy(x);
        QuatFunc.set(this, x, y, z, w);
        this.onChange();
        return this;
    }

    rotateX(a: number): this {
        QuatFunc.rotateX(this, this, a);
        this.onChange();
        return this;
    }

    rotateY(a: number): this {
        QuatFunc.rotateY(this, this, a);
        this.onChange();
        return this;
    }

    rotateZ(a: number): this {
        QuatFunc.rotateZ(this, this, a);
        this.onChange();
        return this;
    }

    inverse(q: Quat = this): this {
        QuatFunc.invert(this, q);
        this.onChange();
        return this;
    }

    conjugate(q: Quat = this): this {
        QuatFunc.conjugate(this, q);
        this.onChange();
        return this;
    }

    copy(q: Array<number>): this
    copy(q: Quat): this {
        QuatFunc.copy(this, q);
        this.onChange();
        return this;
    }

    clone() {
        return new Quat().copy(this);
    }

    normalize(q: Quat = this): this {
        QuatFunc.normalize(this, q);
        this.onChange();
        return this;
    }

    multiply(qA: Quat, qB?: Quat): this {
        if (qB) {
            QuatFunc.multiply(this, qA, qB);
        } else {
            QuatFunc.multiply(this, this, qA);
        }
        this.onChange();
        return this;
    }

    dot(v: Quat): number {
        return QuatFunc.dot(this, v);
    }

    fromMatrix3(matrix3: Mat3): this {
        QuatFunc.fromMat3(this, matrix3);
        this.onChange();
        return this;
    }

    fromEuler(euler: Euler): this {
        QuatFunc.fromEuler(this, euler, euler.order);
        return this;
    }

    fromAxisAngle(axis: Vec3, a: number): this {
        QuatFunc.setAxisAngle(this, axis, a);
        return this;
    }

    slerp(q: Quat, t: number): this {
        QuatFunc.slerp(this, this, q, t);
        return this;
    }

    /**
     * Alias for Quat.slerp
     */
    lerp(q: Quat, t: number): this {
        return this.slerp(q, t);
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
