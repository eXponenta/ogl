import type { Mesh } from '../core/Mesh.js';
import { Camera } from '../core/Camera.js';
import { Program } from '../core/Program.js';
import { GLContext } from '../core/Renderer.js';
import { RenderTarget } from '../core/RenderTarget.js';
export interface IShadowReadyMesh extends Mesh {
    colorProgram?: Program;
    depthProgram?: Program;
}
export interface IShadowPassInit {
    mesh: IShadowReadyMesh;
    receive?: boolean;
    cast?: boolean;
    vertex?: string;
    fragment?: string;
    uniformProjection?: string;
    uniformView?: string;
    uniformTexture?: string;
}
export declare class Shadow {
    readonly gl: GLContext;
    light: Camera;
    target: RenderTarget;
    private depthProgram;
    private castMeshes;
    constructor(gl: GLContext, { light, width, height }: {
        light?: Camera;
        width?: number;
        height?: any;
    });
    add({ mesh, receive, cast, vertex, fragment, uniformProjection, uniformView, uniformTexture, }: IShadowPassInit): void;
    render({ scene }: {
        scene: any;
    }): void;
}
