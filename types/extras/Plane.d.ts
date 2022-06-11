import { Geometry, IGeometryAttribute } from '../core/Geometry.js';
import { GLContext } from '../core/Renderer.js';
export interface IPlaneGeomInit {
    width: number;
    height: number;
    widthSegments: number;
    heightSegments: number;
    attributes: Record<string, Partial<IGeometryAttribute>>;
}
export declare class Plane extends Geometry {
    constructor(gl: GLContext, { width, height, widthSegments, heightSegments, attributes }?: Partial<IPlaneGeomInit>);
    static buildPlane(position: any, normal: any, uv: any, index: any, width: any, height: any, depth: any, wSegs: any, hSegs: any, u?: number, v?: number, w?: number, uDir?: number, vDir?: number, i?: number, ii?: number): void;
}
