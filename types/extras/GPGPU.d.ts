import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { Triangle } from './Triangle.js';
import { GLContext, Renderer } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import type { IRenderPass, IRenderPassInit } from './Post.js';
import { AbstractRenderTaskGroup } from '../core/RenderTaskGroup.js';
import { DefaultRenderTask } from '../core/RenderTask.js';
export declare class GPGPU extends AbstractRenderTaskGroup {
    activeContext: Renderer;
    readonly passes: IRenderPass[];
    private geometry;
    private dataLength;
    private size;
    private coords;
    private uniform;
    private fbo;
    private _enabledPasses;
    private _task;
    constructor(context: GLContext | Renderer, { data, geometry, type, }: {
        data?: Float32Array;
        geometry?: Triangle;
        type?: any;
    });
    addPass({ vertex, fragment, uniforms, textureUniform, enabled }?: Partial<IRenderPassInit>): {
        mesh: Mesh<Geometry<any>, Program<string>>;
        program: Program<string>;
        uniforms: {} | Record<string, {
            value: any;
        }>;
        enabled: boolean;
        textureUniform: string;
    };
    get renderTasks(): Iterable<DefaultRenderTask>;
    [Symbol.iterator](): Generator<DefaultRenderTask, void, unknown>;
    begin(context: Renderer): void;
    finish(): void;
}
