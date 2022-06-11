import { Geometry } from '../core/Geometry.js';
import { GLContext } from '../core/Renderer.js';

export class Triangle extends Geometry {
    constructor(gl: GLContext, { attributes = {} } = {}) {
        Object.assign(attributes, {
            position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
            uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
        });

        super(gl, attributes);
    }
}
