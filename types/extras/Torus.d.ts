import { Geometry, IGeometryAttribute } from '../core/Geometry.js';
import { GLContext } from '../core/Renderer.js';
export interface ITorusGeometryInit {
    radius: number;
    tube: number;
    radialSegments: number;
    tubularSegments: number;
    arc: number;
    attributes: Record<string, Partial<IGeometryAttribute>>;
}
export declare class Torus extends Geometry {
    constructor(gl: GLContext, { radius, tube, radialSegments, tubularSegments, arc, attributes }?: Partial<ITorusGeometryInit>);
}
