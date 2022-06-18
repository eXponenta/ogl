import { Transform } from './Transform.js';
import { GL_ENUMS } from './Renderer.js';
import { Mat3 } from '../math/Mat3.js';
import { Mat4 } from '../math/Mat4.js';
import { nextUUID } from './uuid.js';
export class Mesh extends Transform {
    constructor(_gl, { geometry, program, mode = GL_ENUMS.TRIANGLES, frustumCulled = true, renderOrder = 0 }) {
        super();
        this.modelViewMatrix = new Mat4();
        this.normalMatrix = new Mat3();
        this.beforeRenderCallbacks = [];
        this.afterRenderCallbacks = [];
        this.flipFaces = false;
        this.id = nextUUID();
        this.geometry = geometry;
        this.program = program;
        this.mode = mode;
        // Used to skip frustum culling
        this.frustumCulled = frustumCulled;
        // Override sorting to force an order
        this.renderOrder = renderOrder;
    }
    onBeforeRender(f) {
        this.beforeRenderCallbacks.push(f);
        return this;
    }
    onAfterRender(f) {
        this.afterRenderCallbacks.push(f);
        return this;
    }
    prepare({ context, camera }) {
        this.program.prepare({ context });
        this.geometry.prepare({ context, program: this.program });
        if (camera) {
            // Add empty matrix uniforms to program if unset
            if (!this.program.uniforms.modelMatrix) {
                Object.assign(this.program.uniforms, {
                    modelMatrix: { value: null },
                    viewMatrix: { value: null },
                    modelViewMatrix: { value: null },
                    normalMatrix: { value: null },
                    projectionMatrix: { value: null },
                    cameraPosition: { value: null },
                });
            }
            // Set the matrix uniforms
            this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
            // normal matrix is part of model
            // not part of modelView
            this.normalMatrix.getNormalMatrix(this.worldMatrix);
        }
        // determine if faces need to be flipped - when mesh scaled negatively
        this.flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;
    }
    draw({ camera, context }) {
        this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
        // program can be shared
        // change uniform object ref to valid
        const uniforms = this.program.uniforms;
        if (camera) {
            uniforms.projectionMatrix.value = camera.projectionMatrix;
            uniforms.cameraPosition.value = camera.worldPosition;
            uniforms.viewMatrix.value = camera.viewMatrix;
            uniforms.modelMatrix.value = this.worldMatrix;
            uniforms.modelViewMatrix.value = this.modelViewMatrix;
            uniforms.normalMatrix.value = this.normalMatrix;
        }
        this.program.use({ flipFaces: this.flipFaces, context });
        this.geometry.draw({ mode: this.mode, program: this.program, context });
        this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    }
    destroy() {
        //
    }
}
