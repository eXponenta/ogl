import { Geometry, IGeometryAttribute } from '../core/Geometry.js';
import { GLContext } from '../core/Renderer.js';
export interface ICylinderGeometryInit {
    radiusTop: number;
    radiusBottom: number;
    height: number;
    radialSegments: number;
    heightSegments: number;
    openEnded: boolean;
    thetaStart: number;
    thetaLength: number;
    attributes: Record<string, Partial<IGeometryAttribute>>;
}
export declare class Cylinder extends Geometry {
    constructor(gl: GLContext, { radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength, attributes, }?: Partial<ICylinderGeometryInit>);
}
