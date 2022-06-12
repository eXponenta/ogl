import { Vec3 } from '../math/Vec3.js';
import { Quat } from '../math/Quat.js';
import { Transform } from '../core/Transform.js';
export interface IGLTFAnimRecord {
    times: number[];
    node: Transform;
    transform: 'quaternion' | 'scale' | 'position';
    interpolation: 'STEP' | 'CUBICSPLINE';
    values: number[];
}
export interface IGLTFAnimData extends Array<IGLTFAnimRecord> {
}
export declare class GLTFAnimation {
    readonly data: IGLTFAnimData;
    elapsed: number;
    loop: boolean;
    weight: number;
    startTime: number;
    endTime: number;
    duration: number;
    constructor(data: IGLTFAnimData, weight?: number);
    update(totalWeight?: number, isSet?: boolean): void;
    cubicSplineInterpolate<T extends Quat | Vec3>(t: number, prevVal: T, prevTan: T, nextTan: T, nextVal: T): T;
}
