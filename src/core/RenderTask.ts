import { Vec3 } from "../math/Vec3.js";
import type { Camera } from "./Camera.js";
import type { INativeObjectHolder, IRenderOptions, Renderer } from "./Renderer.js";
import type { RenderTarget } from "./RenderTarget.js";
import type { Transform } from "./Transform.js";

const tempVec3 = new Vec3();


export interface ISortable {
    id: number;
    zDepth: number;
    renderOrder: number;
    program: {
        id: number;
    };
}

type ISortedTraversable = Transform & ISortable & INativeObjectHolder;

export interface IDrawable extends ISortedTraversable {
    frustumCulled?: boolean;

    program: {
        id: number;
        transparent: boolean;
        depthTest: boolean;
    };

    draw(args: { camera: Camera; context: Renderer }): void;
}

export abstract class AbstractRenderTask implements Required<IRenderOptions> {
    public readonly isRenderTask = true;

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

export class DefaultRenderTask extends AbstractRenderTask {
    constructor(options?: IRenderOptions) {
        super();
        this.set(options);
    }

    public set({
        scene,
        camera = null,
        target = null,
        update = true,
        sort = true,
        frustumCull,
        clear
    }: IRenderOptions) {
        this.scene = scene;
        this.clear = clear;
        this.camera = camera;
        this.target = target;
        this.sort = sort;
        this.update = update;
        this.sort = frustumCull;

        return this;
    }

    public sortOpaque(a: ISortable, b: ISortable) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else if (a.zDepth !== b.zDepth) {
            return a.zDepth - b.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    public sortTransparent(a: ISortable, b: ISortable) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        }
        if (a.zDepth !== b.zDepth) {
            return b.zDepth - a.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    public sortUI(a: ISortable, b: ISortable) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else {
            return b.id - a.id;
        }
    }

    public getRenderList(context: Renderer): IDrawable[] {
        const {
            camera, frustumCull, sort, scene
        } = this;

        let renderList: Array<IDrawable> = [];

        if (camera && frustumCull) camera.updateFrustum();

        // Get visible
        scene.traverse((node: IDrawable) => {
            if (!node.visible) return true;
            if (!node.draw) return;

            if (frustumCull && node.frustumCulled && camera) {
                if (!camera.frustumIntersectsMesh(node)) return;
            }

            renderList.push(node);
        });

        if (sort) {
            const opaque = [];
            const transparent = []; // depthTest true
            const ui = []; // depthTest false

            renderList.forEach((node) => {
                // Split into the 3 render groups
                if (!node.program.transparent) {
                    opaque.push(node);
                } else if (node.program.depthTest) {
                    transparent.push(node);
                } else {
                    ui.push(node);
                }

                node.zDepth = 0;

                // Only calculate z-depth if renderOrder unset and depthTest is true
                if (node.renderOrder !== 0 || !node.program.depthTest || !camera) return;

                // update z-depth
                node.worldMatrix.getTranslation(tempVec3);
                tempVec3.applyMatrix4(camera.projectionViewMatrix);
                node.zDepth = tempVec3.z;
            });

            opaque.sort(this.sortOpaque);
            transparent.sort(this.sortTransparent);
            ui.sort(this.sortUI);

            renderList = opaque.concat(transparent, ui);
        }

        return renderList;
    }

    public begin(context: Renderer): boolean {

        // updates all scene graph matrices
        if (this.update && this.scene) this.scene.updateMatrixWorld();

        // Update camera separately, in case not in scene graph
        if (this.camera && this.camera) this.camera.updateMatrixWorld();

        return true;
    }

    public finish(): void {

    }
}
