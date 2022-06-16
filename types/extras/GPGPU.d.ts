import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { Triangle } from './Triangle.js';
import { GLContext, Renderer } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import type { IRenderPass, IRenderPassInit } from './Post.js';
export declare class GPGPU {
    activeContext: Renderer;
    readonly passes: IRenderPass[];
    private geometry;
    private dataLength;
    private size;
    private coords;
    private uniform;
    private fbo;
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
    render(): void;
}
