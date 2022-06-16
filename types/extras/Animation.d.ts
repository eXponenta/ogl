import type { Transform } from '../core/Transform.js';
export interface IAnimData {
    frames: Array<any>;
}
export interface IAnimInit {
    objects: Transform[];
    data: IAnimData;
}
export declare class Animation {
    objects: Transform[];
    data: IAnimData;
    elapsed: number;
    weight: number;
    duration: number;
    constructor({ objects, data }: IAnimInit);
    update(totalWeight?: number, isSet?: boolean): void;
}
