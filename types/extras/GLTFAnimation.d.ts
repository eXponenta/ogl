export class GLTFAnimation {
    constructor(data: any, weight?: number);
    data: any;
    elapsed: number;
    weight: number;
    loop: boolean;
    startTime: any;
    endTime: any;
    duration: number;
    update(totalWeight: number, isSet: any): void;
    cubicSplineInterpolate(t: any, prevVal: any, prevTan: any, nextTan: any, nextVal: any): any;
}
