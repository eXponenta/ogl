import { IGeometryAttributeInit } from '../core/Geometry.js';
import { IUniformData } from '../core/Program.js';
import { Vec3 } from '../math/Vec3.js';
import type { GLContext } from '../core/Renderer.js';
declare type TDefaultUniforms = 'uResolution' | 'uDPR' | 'uThickness' | 'uColor' | 'uMiter';
export interface IPolylineInit {
    points: Array<Vec3>;
    vertex?: string;
    fragment?: string;
    uniforms?: Partial<Record<string | TDefaultUniforms, IUniformData>>;
    attributes?: Record<string, IGeometryAttributeInit>;
}
export declare class Polyline {
    readonly gl: GLContext;
    private points;
    private count;
    private geometry;
    private position;
    private prev;
    private next;
    private resolution;
    private dpr;
    private thickness;
    private color;
    private miter;
    private program;
    private mesh;
    constructor(gl: GLContext, { points, // Array of Vec3s
    vertex, fragment, uniforms, attributes, }: IPolylineInit);
    updateGeometry(): void;
    resize(): void;
}
export {};
