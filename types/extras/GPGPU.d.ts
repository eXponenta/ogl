import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { Triangle } from './Triangle.js';
import type { GLContext } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
import type { IRenderPass, IRenderPassInit } from './Post.js';
export declare class GPGPU {
    readonly gl: GLContext;
    readonly passes: IRenderPass[];
    private geometry;
    private dataLength;
    private size;
    private coords;
    private uniform;
    private fbo;
    constructor(gl: GLContext, { data, geometry, type, }: {
        data?: Float32Array;
        geometry?: Triangle;
        type?: number;
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
