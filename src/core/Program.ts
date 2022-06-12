// TODO: upload empty texture if null ? maybe not
// TODO: upload identity matrix if null ?
// TODO: sampler Cube

import { IProgramSource, ProgramData } from "./ProgramData.js";
import { GLContext, GL_ENUMS, INativeObjectHolder, Renderer } from "./Renderer.js";
import { IBlendEquationState, IBlendFuncState } from "./State.js";
import { Texture } from "./Texture.js";
import { nextUUID } from "./uuid.js";

// cache of typed arrays used to flatten uniform arrays
const arrayCacheF32 = {};

export interface IUniformData<T = any> {
    value: T;
}

export type IDefaultUniforms = 'modelMatrix' | 'projectionMatrix' | 'cameraPosition' | 'viewMatrix' | 'modelViewMatrix' | 'normalMatrix';

export interface IProgramInit<U extends string = ''> extends IProgramSource {
    uniforms: Record<U, IUniformData>;
    transparent: boolean;
    cullFace: GLenum;
    frontFace: GLenum;
    depthTest: boolean;
    depthWrite: boolean;
    depthFunc: GLenum;
}

export class Program<U extends string = any> implements INativeObjectHolder {
    public readonly id: number;
    /**
     * @deprecated GLInstance not stored now
     */
    public readonly gl: GLContext;
    public readonly uniforms: Record<U | IDefaultUniforms, IUniformData>;

    public programData: ProgramData;
    public programSource: {
        vertex: string;
        fragment: string;
    }

    public transparent: boolean;
    public cullFace: GLenum;
    public frontFace: GLenum;
    public depthTest: boolean;
    public depthWrite: boolean;
    public depthFunc: GLenum;

    private blendFunc: IBlendFuncState;
    private blendEquation: IBlendEquationState;

    activeContext: Renderer;

    constructor(
        gl: GLContext,
        {
            vertex,
            fragment,
            uniforms = {} as any,

            transparent = false,
            cullFace = GL_ENUMS.BACK,
            frontFace = GL_ENUMS.CCW,
            depthTest = true,
            depthWrite = true,
            depthFunc = GL_ENUMS.LESS,
        }: Partial<IProgramInit<U>> = {}
    ) {
        this.uniforms = uniforms as Record<U | IDefaultUniforms, IUniformData>;
        this.id = nextUUID();

        if (!vertex) console.warn('vertex shader not supplied');
        if (!fragment) console.warn('fragment shader not supplied');

        // Store program state
        this.transparent = transparent;
        this.cullFace = cullFace;
        this.frontFace = frontFace;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;
        this.depthFunc = depthFunc;
        this.blendFunc = {} as any;
        this.blendEquation = {} as any;
        this.programSource = { vertex, fragment };
    }

    /**
     * Only for backward compatibility
     * Internally we not should use this
     */
    get uniformLocations() {
        return this.programData.uniformLocations;
    }

    get attributeLocations() {
        // we need this because Geometry use it
        return this.programData.attributeLocations;
    }

    get attributeOrder(): string {
        // we need this because a Geometry use it
        return this.programData.attributeOrder;
    }

    /**
     * WebGLProgram instance, can be shared
     * Only for backward compatibility
     * Internally we not should use this
     */
    get program() {
        return this.programData.program;
    }

    setBlendFunc(src: GLenum, dst: GLenum, srcAlpha?: GLenum, dstAlpha?: GLenum) {
        this.blendFunc.src = src;
        this.blendFunc.dst = dst;
        this.blendFunc.srcAlpha = srcAlpha;
        this.blendFunc.dstAlpha = dstAlpha;

        // TODO
        // FIX BUG
        if (src) this.transparent = true;
    }

    setBlendEquation(modeRGB: GLenum, modeAlpha?: GLenum) {
        this.blendEquation.modeRGB = modeRGB;
        this.blendEquation.modeAlpha = modeAlpha;
    }

    applyState(renderer: Renderer) {
        if (this.depthTest) renderer.enable(GL_ENUMS.DEPTH_TEST);
        else renderer.disable(GL_ENUMS.DEPTH_TEST);

        if (this.cullFace) renderer.enable(GL_ENUMS.CULL_FACE);
        else renderer.disable(GL_ENUMS.CULL_FACE);

        if (this.blendFunc.src) renderer.enable(GL_ENUMS.BLEND);
        else renderer.disable(GL_ENUMS.BLEND);

        if (this.cullFace) renderer.setCullFace(this.cullFace);
        renderer.setFrontFace(this.frontFace);
        renderer.setDepthMask(this.depthWrite);
        renderer.setDepthFunc(this.depthFunc);

        renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
        renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);
    }

    prepare ({ context }): void {
        if (!this.programData || this.activeContext !== context) {
            this.programData = ProgramData.create(context.gl, this.programSource);
        }

        const locs = this.programData.uniformLocations;
        const uniforms = this.uniforms;

        for (const { uniformName } of locs.keys()) {
            const uniform = uniforms[uniformName] as IUniformData;

            if (!uniform || !uniform.value) {
                continue;
            }

            if (uniform.value.prepare) {
                uniform.value.prepare({ context });
            } else if (uniform.value.length && uniform.value[0].prepare) {
                for(let t of uniform.value) {
                    t.prepare({ context });
                }
            }
        }

        this.activeContext = context;
    }

    use({ context, flipFaces = false }:{flipFaces?: boolean, context: Renderer} ) {
        let textureUnit = -1;

        const { gl } = context;
        const uniforms = this.uniforms;
        const programData = this.programData;
        const uniformLocations = this.programData.uniformLocations;
        const programActive = context.state.currentProgram === programData.id;

        // Avoid gl call if program already in use
        if (!programActive) {
            gl.useProgram(programData.program);
            context.state.currentProgram = programData.id;
        }

        // Set only the active uniforms found in the shader
        uniformLocations.forEach((location, activeUniform) => {
            let name = activeUniform.uniformName;

            // get supplied uniform
            let uniform = uniforms[name];

            // For structs, get the specific property instead of the entire object
            if (activeUniform.isStruct) {
                uniform = uniform[activeUniform.structProperty];
                name += `.${activeUniform.structProperty}`;
            }
            if (activeUniform.isStructArray) {
                uniform = uniform[activeUniform.structIndex][activeUniform.structProperty];
                name += `[${activeUniform.structIndex}].${activeUniform.structProperty}`;
            }

            if (!uniform) {
                return warn(`Active uniform ${name} has not been supplied`);
            }

            if (uniform && uniform.value === undefined) {
                return warn(`${name} uniform is missing a value parameter`);
            }

            if (uniform.value.texture) {
                textureUnit = textureUnit + 1;

                // Check if texture needs to be updated
                (uniform.value as Texture).bind(textureUnit);
                return setUniform(gl, activeUniform.type, location, textureUnit);
            }

            // For texture arrays, set uniform as an array of texture units instead of just one
            if (uniform.value.length && uniform.value[0].texture) {
                const textureUnits = [];
                uniform.value.forEach((value: Texture) => {
                    textureUnit = textureUnit + 1;
                    value.bind(textureUnit);
                    textureUnits.push(textureUnit);
                });

                return setUniform(gl, activeUniform.type, location, textureUnits);
            }

            setUniform(gl, activeUniform.type, location, uniform.value);
        });

        this.applyState(context);

        if (flipFaces) {
            context.setFrontFace(this.frontFace === gl.CCW ? gl.CW : gl.CCW);
        }
    }

    destroy(): void {
        this.remove();
    }

    remove() {
        this.programData && this.programData.remove();
        this.programData = null;
    }
}

function setUniform(gl, type, location, value) {
    value = value.length ? flatten(value) : value;
    const setValue = gl.renderer.state.uniformLocations.get(location);

    // Avoid redundant uniform commands
    if (value.length) {
        if (setValue === undefined || setValue.length !== value.length) {
            // clone array to store as cache
            gl.renderer.state.uniformLocations.set(location, value.slice(0));
        } else {
            if (arraysEqual(setValue, value)) return;

            // Update cached array values
            setValue.set ? setValue.set(value) : setArray(setValue, value);
            gl.renderer.state.uniformLocations.set(location, setValue);
        }
    } else {
        if (setValue === value) return;
        gl.renderer.state.uniformLocations.set(location, value);
    }

    switch (type) {
        case 5126:
            return value.length ? gl.uniform1fv(location, value) : gl.uniform1f(location, value); // FLOAT
        case 35664:
            return gl.uniform2fv(location, value); // FLOAT_VEC2
        case 35665:
            return gl.uniform3fv(location, value); // FLOAT_VEC3
        case 35666:
            return gl.uniform4fv(location, value); // FLOAT_VEC4
        case 35670: // BOOL
        case 5124: // INT
        case 35678: // SAMPLER_2D
        case 35680:
            return value.length ? gl.uniform1iv(location, value) : gl.uniform1i(location, value); // SAMPLER_CUBE
        case 35671: // BOOL_VEC2
        case 35667:
            return gl.uniform2iv(location, value); // INT_VEC2
        case 35672: // BOOL_VEC3
        case 35668:
            return gl.uniform3iv(location, value); // INT_VEC3
        case 35673: // BOOL_VEC4
        case 35669:
            return gl.uniform4iv(location, value); // INT_VEC4
        case 35674:
            return gl.uniformMatrix2fv(location, false, value); // FLOAT_MAT2
        case 35675:
            return gl.uniformMatrix3fv(location, false, value); // FLOAT_MAT3
        case 35676:
            return gl.uniformMatrix4fv(location, false, value); // FLOAT_MAT4
    }
}

function flatten(a) {
    const arrayLen = a.length;
    const valueLen = a[0].length;
    if (valueLen === undefined) return a;
    const length = arrayLen * valueLen;
    let value = arrayCacheF32[length];
    if (!value) arrayCacheF32[length] = value = new Float32Array(length);
    for (let i = 0; i < arrayLen; i++) value.set(a[i], i * valueLen);
    return value;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0, l = a.length; i < l; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function setArray(a, b) {
    for (let i = 0, l = a.length; i < l; i++) {
        a[i] = b[i];
    }
}

let warnCount = 0;
function warn(message) {
    if (warnCount > 100) return;
    console.warn(message);
    warnCount++;
    if (warnCount > 100) console.warn('More than 100 program warnings - stopping logs.');
}
