import { Vec3 } from "../math/Vec3.js";
const tempVec3 = new Vec3();
export class AbstractRenderTask {
    constructor() {
        this.isRenderTask = true;
    }
}
export class DefaultRenderTask extends AbstractRenderTask {
    constructor(options) {
        super();
        options && this.set(options);
    }
    set({ scene, camera = null, target = null, update = true, sort = true, frustumCull, clear }) {
        this.scene = scene;
        this.clear = clear;
        this.camera = camera;
        this.target = target;
        this.sort = sort;
        this.update = update;
        this.sort = frustumCull;
        return this;
    }
    sortOpaque(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        }
        else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        }
        else if (a.zDepth !== b.zDepth) {
            return a.zDepth - b.zDepth;
        }
        else {
            return b.id - a.id;
        }
    }
    sortTransparent(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        }
        if (a.zDepth !== b.zDepth) {
            return b.zDepth - a.zDepth;
        }
        else {
            return b.id - a.id;
        }
    }
    sortUI(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        }
        else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        }
        else {
            return b.id - a.id;
        }
    }
    getRenderList(context) {
        const { camera, frustumCull, sort, scene } = this;
        let renderList = [];
        if (camera && frustumCull)
            camera.updateFrustum();
        // Get visible
        scene.traverse((node) => {
            if (!node.visible)
                return true;
            if (!node.draw)
                return;
            if (frustumCull && node.frustumCulled && camera) {
                if (!camera.frustumIntersectsMesh(node))
                    return;
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
                }
                else if (node.program.depthTest) {
                    transparent.push(node);
                }
                else {
                    ui.push(node);
                }
                node.zDepth = 0;
                // Only calculate z-depth if renderOrder unset and depthTest is true
                if (node.renderOrder !== 0 || !node.program.depthTest || !camera)
                    return;
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
    begin(context) {
        // updates all scene graph matrices
        if (this.update && this.scene)
            this.scene.updateMatrixWorld();
        // Update camera separately, in case not in scene graph
        if (this.camera && this.camera)
            this.camera.updateMatrixWorld();
        return true;
    }
    finish() {
    }
}
