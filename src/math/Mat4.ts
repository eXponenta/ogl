import * as Mat4Func from './functions/Mat4Func.js';
import type { Vec3 } from './Vec3';
import type { Quat } from './Quat';
import type { WritableArrayLike } from './functions/Mat3Func';

export class Mat4 extends Array<number> {
    constructor(
        m00 = 1,
        m01 = 0,
        m02 = 0,
        m03 = 0,
        m10 = 0,
        m11 = 1,
        m12 = 0,
        m13 = 0,
        m20 = 0,
        m21 = 0,
        m22 = 1,
        m23 = 0,
        m30 = 0,
        m31 = 0,
        m32 = 0,
        m33 = 1
    ) {
        super(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
        return this;
    }

    get x(): number {
        return this[12];
    }

    get y(): number {
        return this[13];
    }

    get z(): number {
        return this[14];
    }

    get w(): number {
        return this[15];
    }

    set x(v: number) {
        this[12] = v;
    }

    set y(v: number) {
        this[13] = v;
    }

    set z(v: number) {
        this[14] = v;
    }

    set w(v: number) {
        this[15] = v;
    }

    set(mat: Mat4): this
    set(array: Array<number>): this
    set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33): this
    set(...args: any[]) {
        if (args[0].length) return this.copy(args[0]);
        Mat4Func.copy(this, args);
        return this;
    }

    translate(v: Vec3, m = this): this {
        Mat4Func.translate(this, m, v);
        return this;
    }

    rotate(v: number, axis: Vec3, m = this): this {
        Mat4Func.rotate(this, m, v, axis);
        return this;
    }

    scale(v: number, m?: Mat4): this
    scale(v: Vec3 | number, m = this): this {
        Mat4Func.scale(this, m, typeof v === 'number' ? [v, v, v] : v);
        return this;
    }

    multiply(ma: Mat4, mb: Mat4): this {
        if (mb) {
            Mat4Func.multiply(this, ma, mb);
        } else {
            Mat4Func.multiply(this, this, ma);
        }
        return this;
    }

    identity(): this {
        Mat4Func.identity(this);
        return this;
    }

    copy(m: Array<number>): this
    copy(m: Mat4) {
        Mat4Func.copy(this, m);
        return this;
    }

    fromPerspective({ fov, aspect, near, far }:{fov: number, aspect: number, near: number, far: number}): this {
        Mat4Func.perspective(this, fov, aspect, near, far);
        return this;
    }

    fromOrthogonal({ left, right, bottom, top, near, far }:{left: number, right: number, bottom: number, top: number, near: number, far: number}): this {
        Mat4Func.ortho(this, left, right, bottom, top, near, far);
        return this;
    }

    fromQuaternion(q: Quat): this {
        Mat4Func.fromQuat(this, q);
        return this;
    }

    setPosition(v: Vec3): this {
        this.x = v[0];
        this.y = v[1];
        this.z = v[2];
        return this;
    }

    inverse(m: Mat4 = this): this {
        Mat4Func.invert(this, m);
        return this;
    }

    compose(q: Quat, pos: Vec3, scale: Vec3): this {
        Mat4Func.fromRotationTranslationScale(this, q, pos, scale);
        return this;
    }

    getRotation(q: Quat): this {
        Mat4Func.getRotation(q, this);
        return this;
    }

    getTranslation(pos: Vec3): this {
        Mat4Func.getTranslation(pos, this);
        return this;
    }

    getScaling(scale: Vec3): this {
        Mat4Func.getScaling(scale, this);
        return this;
    }

    getMaxScaleOnAxis(): number {
        return Mat4Func.getMaxScaleOnAxis(this);
    }

    lookAt(eye: Vec3, target: Vec3, up: Vec3): this {
        Mat4Func.targetTo(this, eye, target, up);
        return this;
    }

    determinant(): number {
        return Mat4Func.determinant(this);
    }

    fromArray(a: WritableArrayLike, o: number = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        this[3] = a[o + 3];
        this[4] = a[o + 4];
        this[5] = a[o + 5];
        this[6] = a[o + 6];
        this[7] = a[o + 7];
        this[8] = a[o + 8];
        this[9] = a[o + 9];
        this[10] = a[o + 10];
        this[11] = a[o + 11];
        this[12] = a[o + 12];
        this[13] = a[o + 13];
        this[14] = a[o + 14];
        this[15] = a[o + 15];
        return this;
    }

    toArray(a: WritableArrayLike = [], o: number = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        a[o + 3] = this[3];
        a[o + 4] = this[4];
        a[o + 5] = this[5];
        a[o + 6] = this[6];
        a[o + 7] = this[7];
        a[o + 8] = this[8];
        a[o + 9] = this[9];
        a[o + 10] = this[10];
        a[o + 11] = this[11];
        a[o + 12] = this[12];
        a[o + 13] = this[13];
        a[o + 14] = this[14];
        a[o + 15] = this[15];
        return a;
    }
}
