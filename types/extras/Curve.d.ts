export class Curve {
    constructor({ points, divisions, type }?: {
        points?: Vec3[];
        divisions?: number;
        type?: string;
    });
    points: Vec3[];
    divisions: number;
    type: string;
    _getQuadraticBezierPoints(divisions?: number): Vec3[];
    _getCubicBezierPoints(divisions?: number): Vec3[];
    _getCatmullRomPoints(divisions?: number, a?: number, b?: number): any[];
    getPoints(divisions?: number, a?: number, b?: number): any[];
}
export namespace Curve {
    export { CATMULLROM };
    export { CUBICBEZIER };
    export { QUADRATICBEZIER };
}
import { Vec3 } from "../math/Vec3.js";
declare const CATMULLROM: "catmullrom";
declare const CUBICBEZIER: "cubicbezier";
declare const QUADRATICBEZIER: "quadraticbezier";
export {};
