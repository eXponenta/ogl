import { Program } from './Program.js';
import { GLContext, INativeObjectHolder, Renderer } from './Renderer.js';
import { Vec3 } from '../math/Vec3.js';
export interface IGeometryAttribute {
    id: number;
    size: number;
    type: GLenum;
    rawData: ArrayBuffer;
    data: Uint16Array | Uint32Array | Float32Array;
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
export declare class Geometry<T extends string = any> implements INativeObjectHolder {
    readonly id: number;
    /**
     * @deprecated
     * Not stored internally
     */
    readonly gl: GLContext;
    readonly attributes: Record<T | TDefaultAttributes, IGeometryAttribute>;
    readonly VAOs: Record<string, WebGLVertexArrayObject>;
    readonly drawRange: {
        start: number;
        count: number;
    };
    instancedCount: number;
    isInstanced: boolean;
    bounds: IGeometryBounds;
    raycast: 'sphere' | 'box';
    activeContext: Renderer;
    constructor(_gl: GLContext, attributes?: Partial<Record<T, IGeometryAttributeInit>>);
    addAttribute(key: T | TDefaultAttributes, attr: IGeometryAttributeInit): number;
    private updateAttribute;
    setIndex(value: Partial<IGeometryAttribute>): void;
    setDrawRange(start: number, count: number): void;
    setInstancedCount(value: number): void;
    private createVAO;
    private bindAttributes;
    prepare({ context, program }: {
        context: Renderer;
        program?: Program;
    }): void;
    draw({ program, mode, context }: {
        program: Program;
        context: Renderer;
        mode: GLenum;
    }): void;
    getPosition(): IGeometryAttribute | boolean;
    computeBoundingBox(attr?: IGeometryAttribute): void;
    computeBoundingSphere(attr?: IGeometryAttribute): void;
    destroy(): void;
    remove(): void;
}
export {};
