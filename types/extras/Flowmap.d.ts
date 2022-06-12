import { GLContext } from '../core/Renderer.js';
export declare class Flowmap {
    readonly gl: GLContext;
    private uniform;
    private mask;
    private mouse;
    private velocity;
    private aspect;
    private mesh;
    constructor(gl: GLContext, { size, // default size of the render targets
    falloff, // size of the stamp, percentage of the size
    alpha, // opacity of the stamp
    dissipation, // affects the speed that the stamp fades. Closer to 1 is slower
    type, }?: {
        size?: number;
        falloff?: number;
        alpha?: number;
        dissipation?: number;
        type?: any;
    });
    update(): void;
}
