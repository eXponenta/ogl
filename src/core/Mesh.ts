import { Program } from './Program.js';
import { Transform } from './Transform.js';
import type { GLContext, IDrawable, Renderer } from './Renderer.js';
import { Geometry } from './Geometry.js';

import { Mat3 } from '../math/Mat3.js';
import { Mat4 } from '../math/Mat4.js';
import { nextUUID } from './uuid.js';
import type { Camera } from './Camera.js';

export interface IMeshInit<G extends Geometry = Geometry, P extends Program = Program> {
    geometry: G;
    program: P;
    mode?: GLenum;
    frustumCulled?: boolean;
    renderOrder?: number;
}

export type IRenderCallback = (args: { mesh: Mesh<any, any>, camera?: Camera }) => void;

export class Mesh<G extends Geometry = Geometry, P extends Program = Program> extends Transform implements IDrawable {
    public readonly gl: GLContext;
    public readonly id: number;
    public geometry: G;
    public program: P;
    public mode: GLenum;
    public frustumCulled: boolean;
    public renderOrder: number;

    private modelViewMatrix: Mat4 = new Mat4();
    private normalMatrix: Mat3 = new Mat3();

    private beforeRenderCallbacks: Array<IRenderCallback> = [];
    private afterRenderCallbacks: Array<IRenderCallback> = [];

    activeContext: Renderer;

    constructor(gl: GLContext, {
        geometry,
        program,
        mode = gl.TRIANGLES,
        frustumCulled = true,
        renderOrder = 0
    }: IMeshInit<G, P>) {
        super();
        if (!gl.canvas) console.error('gl not passed as first argument to Mesh');
        this.gl = gl;
        this.id = nextUUID();
        this.geometry = geometry;
        this.program = program;
        this.mode = mode;

        // Used to skip frustum culling
        this.frustumCulled = frustumCulled;

        // Override sorting to force an order
        this.renderOrder = renderOrder;
    }

    onBeforeRender(f: IRenderCallback): this {
        this.beforeRenderCallbacks.push(f);
        return this;
    }

    onAfterRender(f: IRenderCallback): this {
        this.afterRenderCallbacks.push(f);
        return this;
    }

    prepare ({ context, camera } : { camera: Camera, context: Renderer }): void {
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
            this.program.uniforms.projectionMatrix.value = camera.projectionMatrix;
            this.program.uniforms.cameraPosition.value = camera.worldPosition;
            this.program.uniforms.viewMatrix.value = camera.viewMatrix;
            this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
            this.normalMatrix.getNormalMatrix(this.modelViewMatrix);
            this.program.uniforms.modelMatrix.value = this.worldMatrix;
            this.program.uniforms.modelViewMatrix.value = this.modelViewMatrix;
            this.program.uniforms.normalMatrix.value = this.normalMatrix;
        }
    }

    draw({ camera, context } : { camera: Camera, context: Renderer }) {
        this.beforeRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));

        // determine if faces need to be flipped - when mesh scaled negatively
        let flipFaces = this.program.cullFace && this.worldMatrix.determinant() < 0;

        this.program.use({ flipFaces, context });
        this.geometry.draw({ mode: this.mode, program: this.program, context });

        this.afterRenderCallbacks.forEach((f) => f && f({ mesh: this, camera }));
    }

    destroy(): void {
        //
    }
}
