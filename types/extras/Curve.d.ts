import { Vec3 } from '../math/Vec3.js';
export declare const enum CURVE_TYPE {
    CATMULLROM = "catmullrom",
    CUBICBEZIER = "cubicbezier",
    QUADRATICBEZIER = "quadraticbezier"
}
export interface ICurveInit {
    points: Array<Vec3>;
    divisions: number;
    type: CURVE_TYPE;
}
export declare class Curve {
    static CATMULLROM: CURVE_TYPE;
    static CUBICBEZIER: CURVE_TYPE;
    static QUADRATICBEZIER: CURVE_TYPE;
    points: Array<Vec3>;
    divisions: number;
    type: CURVE_TYPE;
    constructor({ points, divisions, type }?: Partial<ICurveInit>);
    private _getQuadraticBezierPoints;
    private _getCubicBezierPoints;
    private _getCatmullRomPoints;
    getPoints(divisions?: number, a?: number, b?: number): Vec3[];
}
