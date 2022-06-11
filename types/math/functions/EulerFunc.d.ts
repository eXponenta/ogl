export declare type EulerOrder = 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'YZX' | 'XZY';
export declare function fromRotationMatrix(out: Array<number>, m: Array<number>, order?: EulerOrder): number[];
