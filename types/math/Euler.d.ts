import * as EulerFunc from './functions/EulerFunc.js';
import type { Quat } from './Quat.js';
import { Mat4 } from './Mat4.js';
export declare class Euler extends Array<number> {
    order: EulerFunc.EulerOrder;
    onChange: () => void;
    constructor(x?: number, y?: number, z?: number, order?: EulerFunc.EulerOrder);
    get x(): number;
    get y(): number;
    get z(): number;
    set x(v: number);
    set y(v: number);
    set z(v: number);
    set(copy: Euler): this;
    set(copy: Array<number>): this;
    set(x: number, y?: number, z?: number): this;
    copy(copy: Euler): this;
    copy(copy: Array<number>): this;
    clone(): Euler;
    reorder(order: EulerFunc.EulerOrder): this;
    fromRotationMatrix(m: Mat4, order?: EulerFunc.EulerOrder): this;
    fromQuaternion(q: Quat, order?: EulerFunc.EulerOrder): this;
    toArray(a?: Array<number>, o?: number): number[];
}
