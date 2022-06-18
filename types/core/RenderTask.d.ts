import type { Camera } from "./Camera.js";
import type { INativeObjectHolder, IRenderOptions, Renderer } from "./Renderer.js";
import type { RenderTarget } from "./RenderTarget.js";
import type { Transform } from "./Transform.js";
export interface ISortable {
    id: number;
    zDepth: number;
    renderOrder: number;
    program: {
        id: number;
    };
}
declare type ISortedTraversable = Transform & ISortable & INativeObjectHolder;
export interface IDrawable extends ISortedTraversable {
    frustumCulled?: boolean;
    program: {
        id: number;
        transparent: boolean;
        depthTest: boolean;
    };
    draw(args: {
        camera: Camera;
        context: Renderer;
    }): void;
}
export declare abstract class AbstractRenderTask implements Required<IRenderOptions> {
    readonly isRenderTask = true;
    scene: Transform;
    camera: Camera;
    target: RenderTarget;
    update: boolean;
    sort: boolean;
    frustumCull: boolean;
    clear: boolean;
    /**
     * prepare should return true if all render state pushed internal renderTask
     */
    abstract begin(context: Renderer): boolean | undefined;
    abstract getRenderList(context: Renderer): IDrawable[] | null;
    abstract finish(): void;
}
export declare class DefaultRenderTask extends AbstractRenderTask {
    constructor(options?: IRenderOptions);
    set({ scene, camera, target, update, sort, frustumCull, clear }: IRenderOptions): this;
    sortOpaque(a: ISortable, b: ISortable): number;
    sortTransparent(a: ISortable, b: ISortable): number;
    sortUI(a: ISortable, b: ISortable): number;
    getRenderList(context: Renderer): IDrawable[];
    begin(context: Renderer): boolean;
    finish(): void;
}
export {};
