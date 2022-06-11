import { Geometry } from '../core/Geometry.js';
import { GLContext } from '../core/Renderer.js';
import { IPlaneGeomInit } from './Plane.js';
export interface IBoxGeometryInit extends IPlaneGeomInit {
    depth: number;
    depthSegments: number;
}
export declare class Box extends Geometry {
    constructor(gl: GLContext, { width, height, depth, widthSegments, heightSegments, depthSegments, attributes }?: Partial<IBoxGeometryInit>);
}
