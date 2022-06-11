import type { IDisposable } from './IDisposable';
import { Program } from './Program.js';
import { GLContext } from './Renderer.js';
import { RenderState } from './State.js';
import { Vec3 } from '../math/Vec3.js';
export interface IGeometryAttribute {
    id: number;
    size: number;
    type: GLenum;
    data: Uint16Array | Float32Array;
    target: GLenum;
    usage: GLenum;
    normalized: boolean;
    stride: number;
    offset: number;
    count: number;
    divisor: number;
    instanced: number;
    needsUpdate: boolean;
    buffer: WebGLBuffer;
}
export interface IGeometryBounds {
    min: Vec3;
    max: Vec3;
    center: Vec3;
    scale: Vec3;
    radius: number;
}
export declare class Geometry implements IDisposable {
    readonly id: number;
    readonly gl: GLContext;
    readonly attributes: Record<string, IGeometryAttribute>;
    readonly VAOs: Record<string, WebGLVertexArrayObject>;
    readonly drawRange: {
        start: number;
        count: number;
    };
    readonly glState: RenderState;
    instancedCount: number;
    isInstanced: boolean;
    bounds: IGeometryBounds;
    raycast: string;
    constructor(gl: GLContext, attributes?: {});
    addAttribute(key: string, attr: Partial<IGeometryAttribute>): number;
    updateAttribute(attr: Partial<IGeometryAttribute>): void;
    setIndex(value: Partial<IGeometryAttribute>): void;
    setDrawRange(start: number, count: number): void;
    setInstancedCount(value: any): void;
    createVAO(program: Program): void;
    bindAttributes(program: any): void;
    draw({ program, mode }: {
        program: any;
        mode?: number;
    }): void;
    getPosition(): IGeometryAttribute | boolean;
    computeBoundingBox(attr?: IGeometryAttribute): void;
    computeBoundingSphere(attr?: IGeometryAttribute): void;
    destroy(): void;
    remove(): void;
}
