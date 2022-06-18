import type { Transform } from './Transform.js';
import type { Camera } from './Camera.js';
import type { RenderTarget } from './RenderTarget.js';
import { RenderState } from './State.js';
import { IDisposable } from './IDisposable.js';
import { DefaultRenderTask, AbstractRenderTask } from './RenderTask.js';
import { AbstractRenderTaskGroup } from './RenderTaskGroup.js';
export interface INativeObjectHolder extends IDisposable {
    activeContext: Renderer;
    /**
     * Called when object is used for specific render process
     */
    prepare(args: {
        context: Renderer;
        camera: Camera;
    }): void;
}
export interface IRendererInit extends WebGLContextAttributes {
    canvas: HTMLCanvasElement;
    context?: GLContext;
    width: number;
    height: number;
    dpr: number;
    autoClear: boolean;
    webgl: 1 | 2;
    frustumCull?: boolean;
}
export interface IRenderOptions {
    scene: Transform;
    camera?: Camera;
    target?: RenderTarget;
    update?: boolean;
    sort?: boolean;
    frustumCull?: boolean;
    clear?: boolean;
}
export declare type GLContext = (WebGL2RenderingContext | WebGLRenderingContext) & {
    renderer?: Renderer;
};
export declare const GL_ENUMS: WebGL2RenderingContext | WebGLRenderingContext;
export declare class Renderer {
    dpr: number;
    alpha: boolean;
    color: boolean;
    depth: boolean;
    stencil: boolean;
    premultipliedAlpha: boolean;
    autoClear: boolean;
    frustumCull: boolean;
    width: number;
    height: number;
    readonly id: number;
    readonly gl: GLContext;
    readonly isWebgl2: boolean;
    readonly renderGroups: AbstractRenderTaskGroup[];
    readonly baseRenderTask: DefaultRenderTask;
    readonly state: RenderState;
    readonly extensions: Record<string, any>;
    parameters: Record<string, number>;
    /**
     * @deprecated
     */
    currentGeometry: string;
    constructor({ context, canvas, width, height, dpr, alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference, autoClear, webgl, frustumCull }?: Partial<IRendererInit>);
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
    /**
     * Guarded version for bindTexture
     */
    bindTexture(target: GLenum, texture: WebGLTexture, unit?: number): void;
    bindFramebuffer({ target, buffer }?: {
        target?: number;
        buffer?: any;
    }): void;
    getExtension(extension: string, webgl2Func?: string, extFunc?: string): any;
    setRenderGroups(tasks: (AbstractRenderTask | AbstractRenderTaskGroup)[]): void;
    render(options: IRenderOptions | AbstractRenderTask): void;
    render(options: (IRenderOptions | AbstractRenderTask)[]): void;
    render(group: AbstractRenderTaskGroup | AbstractRenderTaskGroup[]): void;
    render(): void;
    _executeRenderTask(run: AbstractRenderTask | IRenderOptions): void;
    clear(target: RenderTarget): void;
}
