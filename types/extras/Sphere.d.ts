import { Geometry, IGeometryAttribute } from '../core/Geometry.js';
import { GLContext } from '../core/Renderer.js';
export interface ISphereGeometryInit {
    radius: number;
    widthSegments: number;
    heightSegments: number;
    phiStart: number;
    phiLength: number;
    thetaStart: number;
    thetaLength: number;
    attributes: Record<string, Partial<IGeometryAttribute>>;
}
export declare class Sphere extends Geometry {
    constructor(gl: GLContext, { radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength, attributes, }?: Partial<ISphereGeometryInit>);
}
