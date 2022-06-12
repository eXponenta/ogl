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
export declare type IGeometryAttributeInit = Partial<IGeometryAttribute>;
export interface IGeometryBounds {
    min: Vec3;
    max: Vec3;
    center: Vec3;
    scale: Vec3;
    radius: number;
}
declare type TDefaultAttributes = 'index' | 'position';
export declare class Geometry<T extends string = any> implements IDisposable {
    readonly id: number;
    readonly gl: GLContext;
    readonly attributes: Record<T | TDefaultAttributes, IGeometryAttribute>;
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
    constructor(gl: GLContext, attributes?: Partial<Record<T, IGeometryAttributeInit>>);
    addAttribute(key: T | TDefaultAttributes, attr: IGeometryAttributeInit): number;
    updateAttribute(attr: IGeometryAttributeInit): void;
    setIndex(value: Partial<IGeometryAttribute>): void;
    setDrawRange(start: number, count: number): void;
    setInstancedCount(value: number): void;
    createVAO(program: Program): void;
    bindAttributes(program: Program): void;
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
export {};
