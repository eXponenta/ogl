import type { Transform } from './Transform.js';
import type { Camera } from './Camera.js';
import type { RenderTarget } from './RenderTarget.js';
import { RenderState } from './State.js';
export interface ISortable {
    id: number;
    zDepth: number;
    renderOrder: number;
    program: {
        id: number;
    };
}
declare type ISortedTraversable = Transform & ISortable;
export interface IDrawable extends ISortedTraversable {
    program: {
        id: number;
        transparent: boolean;
        depthTest: boolean;
    };
    draw(...args: any[]): void;
}
export interface IRendererInit {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    dpr: number;
    alpha: boolean;
    depth: boolean;
    stencil: boolean;
    antialias: boolean;
    premultipliedAlpha: boolean;
    preserveDrawingBuffer: boolean;
    powerPreference: 'default' | 'high-performance';
    autoClear: boolean;
    webgl: 1 | 2;
}
export interface IRenderOptions {
    scene: Transform;
    camera: Camera;
    target?: RenderTarget;
    update?: boolean;
    sort?: boolean;
    frustumCull?: boolean;
    clear?: boolean;
}
export declare type GLContext = (WebGL2RenderingContext | WebGLRenderingContext) & {
    renderer?: Renderer;
};
export declare class Renderer {
    dpr: number;
    alpha: boolean;
    color: boolean;
    depth: boolean;
    stencil: boolean;
    premultipliedAlpha: boolean;
    autoClear: boolean;
    width: number;
    height: number;
    readonly id: number;
    readonly gl: GLContext;
    readonly isWebgl2: boolean;
    readonly state: RenderState;
    readonly extensions: Record<string, any>;
    parameters: Record<string, number>;
    /**
     * @deprecated
     */
    currentGeometry: string;
    constructor({ canvas, width, height, dpr, alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference, autoClear, webgl, }?: Partial<IRendererInit>);
    vertexAttribDivisor(...params: Parameters<WebGL2RenderingContext['vertexAttribDivisor']>): void;
    drawArraysInstanced(...params: Parameters<WebGL2RenderingContext['drawArraysInstanced']>): void;
    drawElementsInstanced(...params: Parameters<WebGL2RenderingContext['drawElementsInstanced']>): void;
    _createVertexArray(...params: Parameters<WebGL2RenderingContext['createVertexArray']>): WebGLVertexArrayObject;
    _bindVertexArray(...params: Parameters<WebGL2RenderingContext['bindVertexArray']>): void;
    _deleteVertexArray(...params: Parameters<WebGL2RenderingContext['deleteVertexArray']>): void;
    drawBuffers(...params: Parameters<WebGL2RenderingContext['drawBuffers']>): void;
    /**
     * Guarded version for valid VAO state
     */
    createVertexArray(...params: Parameters<WebGL2RenderingContext['createVertexArray']>): WebGLVertexArrayObject;
    bindVertexArray(vao: WebGLVertexArrayObject): void;
    deleteVertexArray(vao: WebGLVertexArrayObject): void;
    bindBuffer(target: GLenum, buffer?: WebGLBuffer): void;
    deleteBuffer(buffer: WebGLBuffer): void;
    setSize(width: number, height: number): void;
    setViewport(width: number, height: number, x?: number, y?: number): void;
    setScissor(width: number, height: number, x?: number, y?: number): void;
    enable(id: GLenum): void;
    disable(id: GLenum): void;
    setBlendFunc(src: GLenum, dst: GLenum, srcAlpha?: GLenum, dstAlpha?: GLenum): void;
    setBlendEquation(modeRGB: GLenum, modeAlpha?: GLenum): void;
    setCullFace(value: GLenum): void;
    setFrontFace(value: GLenum): void;
    setDepthMask(value: boolean): void;
    setDepthFunc(value: GLenum): void;
    activeTexture(value: number): void;
    bindFramebuffer({ target, buffer }?: {
        target?: number;
        buffer?: any;
    }): void;
    getExtension(extension: string, webgl2Func?: string, extFunc?: string): any;
    sortOpaque(a: ISortable, b: ISortable): number;
    sortTransparent(a: ISortable, b: ISortable): number;
    sortUI(a: ISortable, b: ISortable): number;
    getRenderList({ scene, camera, frustumCull, sort }: {
        scene: any;
        camera: any;
        frustumCull: any;
        sort: any;
    }): IDrawable[];
    render({ scene, camera, target, update, sort, frustumCull, clear }: IRenderOptions): void;
}
export {};
