// attribute params
// {
//     data - typed array eg UInt16Array for indices, Float32Array
//     size - int default 1
//     instanced - default null. Pass divisor amount
//     type - gl enum default gl.UNSIGNED_SHORT for 'index', gl.FLOAT for others
//     normalized - boolean default false
import { GL_ENUMS } from './Renderer.js';
import { nextUUID } from './uuid.js';
import { Vec3 } from '../math/Vec3.js';
const tempVec3 = new Vec3();
let ATTR_ID = 1;
// To stop inifinite warnings
let isBoundsWarned = false;
export class Geometry {
    constructor(_gl, attributes = {}) {
        this.VAOs = {};
        this.drawRange = { start: 0, count: 0 };
        this.instancedCount = 0;
        this.attributes = attributes;
        this.id = nextUUID();
        this.instancedCount = 0;
        // create the buffers
        for (let key in attributes) {
            this.addAttribute(key, attributes[key]);
        }
    }
    addAttribute(key, attr) {
        this.attributes[key] = attr;
        // Set options
        attr.id = ATTR_ID++; // TODO: currently unused, remove?
        attr.size = attr.size || 1;
        attr.type =
            attr.type ||
                (attr.data.constructor === Float32Array
                    ? GL_ENUMS.FLOAT
                    : attr.data.constructor === Uint16Array
                        ? GL_ENUMS.UNSIGNED_SHORT
                        : GL_ENUMS.UNSIGNED_INT); // Uint32Array
        attr.target = key === 'index' ? GL_ENUMS.ELEMENT_ARRAY_BUFFER : GL_ENUMS.ARRAY_BUFFER;
        attr.normalized = attr.normalized || false;
        attr.stride = attr.stride || 0;
        attr.offset = attr.offset || 0;
        attr.count = attr.count || (attr.stride ? attr.data.byteLength / attr.stride : attr.data.length / attr.size);
        attr.divisor = attr.instanced || 0;
        attr.needsUpdate = !attr.buffer;
        attr.usage = attr.usage || GL_ENUMS.STATIC_DRAW;
        // Update geometry counts. If indexed, ignore regular attributes
        if (attr.divisor) {
            this.isInstanced = true;
            if (this.instancedCount && this.instancedCount !== attr.count * attr.divisor) {
                console.warn('geometry has multiple instanced buffers of different length');
                return (this.instancedCount = Math.min(this.instancedCount, attr.count * attr.divisor));
            }
            this.instancedCount = attr.count * attr.divisor;
        }
        else if (key === 'index') {
            this.drawRange.count = attr.count;
        }
        else if (!this.attributes.index) {
            this.drawRange.count = Math.max(this.drawRange.count, attr.count);
        }
    }
    updateAttribute(context, attr, forceBind = false) {
        var _a, _b;
        const isNewBuffer = !attr.buffer;
        const needUpdate = isNewBuffer || attr.needsUpdate;
        if (isNewBuffer)
            attr.buffer = context.gl.createBuffer();
        if (needUpdate || forceBind) {
            context.bindBuffer(attr.target, attr.buffer);
        }
        // skip update
        if (!needUpdate) {
            return;
        }
        if (isNewBuffer) {
            context.gl.bufferData(attr.target, (_a = attr.rawData) !== null && _a !== void 0 ? _a : attr.data, attr.usage);
        }
        else {
            context.gl.bufferSubData(attr.target, 0, (_b = attr.rawData) !== null && _b !== void 0 ? _b : attr.data);
        }
        attr.needsUpdate = false;
    }
    setIndex(value) {
        this.addAttribute('index', value);
    }
    setDrawRange(start, count) {
        this.drawRange.start = start;
        this.drawRange.count = count;
    }
    setInstancedCount(value) {
        this.instancedCount = value;
    }
    createVAO(context, program) {
        this.VAOs[program.attributeOrder] = context.createVertexArray();
        context.bindVertexArray(this.VAOs[program.attributeOrder]);
        this.bindAttributes(context, program);
    }
    bindAttributes(context, program) {
        const { gl } = context;
        // Link all attributes to program using gl.vertexAttribPointer
        program.attributeLocations.forEach((location, { name, type }) => {
            // If geometry missing a required shader attribute
            if (!this.attributes[name]) {
                console.warn(`active attribute ${name} not being supplied`);
                return;
            }
            const attr = this.attributes[name];
            this.updateAttribute(context, attr, true);
            // For matrix attributes, buffer needs to be defined per column
            let numLoc = 1;
            if (type === 35674)
                numLoc = 2; // mat2
            if (type === 35675)
                numLoc = 3; // mat3
            if (type === 35676)
                numLoc = 4; // mat4
            const size = attr.size / numLoc;
            const stride = numLoc === 1 ? 0 : numLoc * numLoc * numLoc;
            const offset = numLoc === 1 ? 0 : numLoc * numLoc;
            for (let i = 0; i < numLoc; i++) {
                gl.vertexAttribPointer(location + i, size, attr.type, attr.normalized, attr.stride + stride, attr.offset + i * offset);
                gl.enableVertexAttribArray(location + i);
                // For instanced attributes, divisor needs to be set.
                // For firefox, need to set back to 0 if non-instanced drawn after instanced. Else won't render
                context.vertexAttribDivisor(location + i, attr.divisor);
            }
        });
        if (this.attributes.index) {
            this.updateAttribute(context, this.attributes.index, true);
        }
    }
    // TODO handle multiple context
    prepare({ context, program }) {
        if (!this.VAOs[program.attributeOrder]) {
            this.createVAO(context, program);
        }
        // Check if any attributes need updating
        // or filling
        program.attributeLocations.forEach((location, { name }) => {
            const attr = this.attributes[name];
            if (attr.needsUpdate) {
                this.updateAttribute(context, attr);
            }
        });
        this.activeContext = context;
    }
    draw({ program, mode = GL_ENUMS.TRIANGLES, context }) {
        context.bindVertexArray(this.VAOs[program.attributeOrder]);
        if (this.isInstanced) {
            if (this.attributes.index) {
                context.drawElementsInstanced(mode, this.drawRange.count, this.attributes.index.type, this.attributes.index.offset + this.drawRange.start * 2, this.instancedCount);
            }
            else {
                context.drawArraysInstanced(mode, this.drawRange.start, this.drawRange.count, this.instancedCount);
            }
        }
        else {
            if (this.attributes.index) {
                context.gl.drawElements(mode, this.drawRange.count, this.attributes.index.type, this.attributes.index.offset + this.drawRange.start * 2);
            }
            else {
                context.gl.drawArrays(mode, this.drawRange.start, this.drawRange.count);
            }
        }
    }
    getPosition() {
        // Use position buffer, or min/max if available
        const attr = this.attributes.position;
        // if (attr.min) return [...attr.min, ...attr.max];
        if (attr.data)
            return attr;
        if (isBoundsWarned)
            return;
        console.warn('No position buffer data found to compute bounds');
        return (isBoundsWarned = true);
    }
    computeBoundingBox(attr) {
        if (!attr)
            attr = this.getPosition();
        const array = attr.data;
        const stride = attr.stride ? attr.stride / array.BYTES_PER_ELEMENT : attr.size;
        if (!this.bounds) {
            this.bounds = {
                min: new Vec3(),
                max: new Vec3(),
                center: new Vec3(),
                scale: new Vec3(),
                radius: Infinity,
            };
        }
        const min = this.bounds.min;
        const max = this.bounds.max;
        const center = this.bounds.center;
        const scale = this.bounds.scale;
        min.set(+Infinity);
        max.set(-Infinity);
        // TODO: check size of position (eg triangle with Vec2)
        for (let i = 0, l = array.length; i < l; i += stride) {
            const x = array[i];
            const y = array[i + 1];
            const z = array[i + 2];
            min.x = Math.min(x, min.x);
            min.y = Math.min(y, min.y);
            min.z = Math.min(z, min.z);
            max.x = Math.max(x, max.x);
            max.y = Math.max(y, max.y);
            max.z = Math.max(z, max.z);
        }
        scale.sub(max, min);
        center.add(min, max).divide(2);
    }
    computeBoundingSphere(attr) {
        if (!attr)
            attr = this.getPosition();
        const array = attr.data;
        const stride = attr.stride ? attr.stride / array.BYTES_PER_ELEMENT : attr.size;
        if (!this.bounds)
            this.computeBoundingBox(attr);
        let maxRadiusSq = 0;
        for (let i = 0, l = array.length; i < l; i += stride) {
            tempVec3.fromArray(array, i);
            maxRadiusSq = Math.max(maxRadiusSq, this.bounds.center.squaredDistance(tempVec3));
        }
        this.bounds.radius = Math.sqrt(maxRadiusSq);
    }
    destroy() {
        this.remove();
    }
    remove() {
        for (let key in this.VAOs) {
            this.gl.renderer.deleteVertexArray(this.VAOs[key]);
            delete this.VAOs[key];
        }
        for (let key in this.attributes) {
            this.gl.deleteBuffer(this.attributes[key].buffer);
            delete this.attributes[key];
        }
    }
}
