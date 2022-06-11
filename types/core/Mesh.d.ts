import { Program } from './Program.js';
import { Transform } from './Transform.js';
import { GLContext, IDrawable } from './Renderer.js';
import { Geometry } from './Geometry.js';
import { Camera } from './Camera.js';
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
    constructor(gl: GLContext, { geometry, program, mode, frustumCulled, renderOrder }: IMeshInit<G, P>);
    onBeforeRender(f: IRenderCallback): this;
    onAfterRender(f: IRenderCallback): this;
    preDraw(): void;
    draw({ camera }?: {
        camera?: Camera;
    }): void;
}
