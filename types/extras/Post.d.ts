import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { RenderTarget } from '../core/RenderTarget.js';
import { GLContext, IRenderOptions, Renderer } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import { AbstractRenderTaskGroup } from '../core/RenderTaskGroup.js';
import { DefaultRenderTask } from '../core/RenderTask.js';
import { Texture } from '../core/Texture.js';
export interface IPostInit {
    width: number;
    height: number;
    dpr: number;
    wrapS?: GLenum;
    wrapT?: GLenum;
    minFilter?: GLenum;
    magFilter?: GLenum;
    geometry?: Geometry;
    targetOnly?: boolean;
}
export interface IRenderPassInit {
    vertex: string;
    fragment: string;
    uniforms: Record<string, {
        value: any;
    }> | {};
    enabled: boolean;
    textureUniform: string;
}
export interface IRenderPass {
    mesh: Mesh;
    program: Program;
    uniforms: Record<string, {
        value: any;
    }> | {};
    enabled: boolean;
    textureUniform: string;
}
export interface IPostOptions extends IRenderOptions {
    texture: Texture<any>;
}
export interface ISwapChain {
    read: RenderTarget;
    write: RenderTarget;
    swap(): void;
}
export declare class Post extends AbstractRenderTaskGroup {
    /**
     * @deprecated, always null, not use it. use activeContext instead
     *
     */
    readonly gl: GLContext;
    readonly activeContext: Renderer;
    readonly options: {
        wrapS: GLenum;
        wrapT: GLenum;
        minFilter: GLenum;
        magFilter: GLenum;
        width: number;
        height: number;
    };
    readonly geometry: Geometry;
    readonly targetOnly: boolean;
    readonly passes: IRenderPass[];
    width: number;
    height: number;
    dpr: number;
    private uniform;
    private fbo;
    private _enabledPasses;
    private _postTask;
    private _sceneOptions;
    constructor(context: GLContext | Renderer, { width, height, dpr, wrapS, wrapT, minFilter, magFilter, geometry, targetOnly, }?: Partial<IPostInit>);
    addPass({ vertex, fragment, uniforms, textureUniform, enabled }?: Partial<IRenderPassInit>): {
        mesh: Mesh<Geometry<any>, Program<string>>;
        program: Program<string>;
        uniforms: {} | Record<string, {
            value: any;
        }>;
        enabled: boolean;
        textureUniform: string;
    };
    resize({ width, height, dpr }?: {
        width?: number;
        height?: number;
        dpr?: number;
    }): void;
    setRenderOptions(options: IPostOptions): void;
    /**
     * @deprecated
     * Use post as render task group
     */
    render(option: IPostOptions): void;
    get renderTasks(): Iterable<DefaultRenderTask>;
    [Symbol.iterator](): Generator<DefaultRenderTask, void, unknown>;
    begin(context: Renderer): void;
    finish(): void;
}
