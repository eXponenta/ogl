import * as EulerFunc from './functions/EulerFunc.js';
import type { Quat } from './Quat';
import { Mat4 } from './Mat4.js';

const tmpMat4 = new Mat4();

export class Euler extends Array<number> {
    public order: EulerFunc.EulerOrder;

    onChange: () => void;

    constructor(x = 0, y = x, z = x, order: EulerFunc.EulerOrder = 'YXZ') {
        super(x, y, z);
        this.order = order;
        this.onChange = () => {};
        return this;
    }

    get x(): number {
        return this[0];
    }

    get y(): number {
        return this[1];
    }

    get z(): number {
        return this[2];
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

    set (copy: Euler): this
    set (copy: Array<number>): this
    set (x: number, y?: number, z?: number): this
    set (x: any, y = x, z = x) {
        if (x.length) return this.copy(x);
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this.onChange();
        return this;
    }

    copy (copy: Euler): this
    copy (copy: Array<number>): this
    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        this.onChange();
        return this;
    }

    reorder(order: EulerFunc.EulerOrder) {
        this.order = order;
        this.onChange();
        return this;
    }

    fromRotationMatrix(m: Mat4, order: EulerFunc.EulerOrder = this.order) {
        EulerFunc.fromRotationMatrix(this, m, order);
        return this;
    }

    fromQuaternion(q: Quat, order: EulerFunc.EulerOrder = this.order) {
        tmpMat4.fromQuaternion(q);
        return this.fromRotationMatrix(tmpMat4, order);
    }

    toArray(a: Array<number> = [], o: number = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }
}
