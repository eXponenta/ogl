import { Program } from './Program.js';
import { Transform } from './Transform.js';
import { GLContext, Renderer } from './Renderer.js';
import { Geometry } from './Geometry.js';
import type { Camera } from './Camera.js';
import type { IDrawable } from './RenderTask.js';
export interface IMeshInit<G extends Geometry = Geometry, P extends Program = Program> {
    geometry: G;
    program: P;
    mode?: GLenum;
    frustumCulled?: boolean;
    renderOrder?: number;
}
export declare type IRenderCallback = (args: {
    mesh: Mesh<any, any>;
    camera?: Camera;
}) => void;
export declare class Mesh<G extends Geometry = Geometry, P extends Program = Program> extends Transform implements IDrawable {
    /**
     * @deprecated always null, not use it
     */
    readonly gl: GLContext;
    readonly id: number;
    geometry: G;
    program: P;
    mode: GLenum;
    frustumCulled: boolean;
    renderOrder: number;
    private modelViewMatrix;
    private normalMatrix;
    private beforeRenderCallbacks;
    private afterRenderCallbacks;
    private flipFaces;
    activeContext: Renderer;
    constructor(_gl: GLContext, { geometry, program, mode, frustumCulled, renderOrder }: IMeshInit<G, P>);
    onBeforeRender(f: IRenderCallback): this;
    onAfterRender(f: IRenderCallback): this;
    prepare({ context, camera }: {
        camera: Camera;
        context: Renderer;
    }): void;
    draw({ camera, context }: {
        camera: Camera;
        context: Renderer;
    }): void;
    destroy(): void;
}
