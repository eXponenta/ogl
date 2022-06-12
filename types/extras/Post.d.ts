import { Program } from '../core/Program.js';
import { Mesh } from '../core/Mesh.js';
import { RenderTarget } from '../core/RenderTarget.js';
import type { GLContext } from '../core/Renderer.js';
import type { Geometry } from '../core/Geometry.js';
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
export interface ISwapChain {
    read: RenderTarget;
    write: RenderTarget;
    swap(): void;
}
export declare class Post {
    readonly gl: GLContext;
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
    constructor(gl: GLContext, { width, height, dpr, wrapS, wrapT, minFilter, magFilter, geometry, targetOnly, }?: Partial<IPostInit>);
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
    render({ scene, camera, texture, target, update, sort, frustumCull }: {
        scene: any;
        camera: any;
        texture: any;
        target?: any;
        update?: boolean;
        sort?: boolean;
        frustumCull?: boolean;
    }): void;
}
