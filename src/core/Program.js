// TODO: upload empty texture if null ? maybe not
// TODO: upload identity matrix if null ?
// TODO: sampler Cube

let ID = 1;

// cache of typed arrays used to flatten uniform arrays
const arrayCacheF32 = {};

export class Program {
    constructor(
        gl,
        {
            vertex,
            fragment,
            uniforms = {},

            transparent = false,
            cullFace = gl.BACK,
            frontFace = gl.CCW,
            depthTest = true,
            depthWrite = true,
            depthFunc = gl.LESS,
        } = {}
    ) {
        if (!gl.canvas) console.error('gl not passed as fist argument to Program');
        this.gl = gl;
        this.uniforms = uniforms;
        this.id = ID++;
        this.refCount = { value: 1 }; // shared reference count of program clones

        // Store program state
        this.transparent = transparent;
        this.cullFace = cullFace;
        this.frontFace = frontFace;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;
        this.depthFunc = depthFunc;
        this.blendFunc = {};
        this.blendEquation = {};

        // set default blendFunc if transparent flagged
        if (this.transparent && !this.blendFunc.src) {
            if (this.gl.renderer.premultipliedAlpha) this.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            else this.setBlendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        }

        const compiled = compileProgram(gl, vertex, fragment);
        this.program = compiled.program;
        this.uniformLocations = compiled.uniformLocations;
        this.attributeLocations = compiled.attributeLocations;
        this.attributeOrder = compiled.attributeOrder;
        this.isDefaultProgram = compiled.isDefaultProgram;
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        this.blendFunc.src = src;
        this.blendFunc.dst = dst;
        this.blendFunc.srcAlpha = srcAlpha;
        this.blendFunc.dstAlpha = dstAlpha;
        if (src) this.transparent = true;
    }

    setBlendEquation(modeRGB, modeAlpha) {
        this.blendEquation.modeRGB = modeRGB;
        this.blendEquation.modeAlpha = modeAlpha;
    }

    applyState() {
        if (this.depthTest) this.gl.renderer.enable(this.gl.DEPTH_TEST);
        else this.gl.renderer.disable(this.gl.DEPTH_TEST);

        if (this.cullFace) this.gl.renderer.enable(this.gl.CULL_FACE);
        else this.gl.renderer.disable(this.gl.CULL_FACE);

        if (this.blendFunc.src) this.gl.renderer.enable(this.gl.BLEND);
        else this.gl.renderer.disable(this.gl.BLEND);

        if (this.cullFace) this.gl.renderer.setCullFace(this.cullFace);
        this.gl.renderer.setFrontFace(this.frontFace);
        this.gl.renderer.setDepthMask(this.depthWrite);
        this.gl.renderer.setDepthFunc(this.depthFunc);
        if (this.blendFunc.src)
            this.gl.renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
        this.gl.renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);
    }

    use({ flipFaces = false } = {}) {
        let textureUnit = -1;
        const programActive = this.gl.renderer.state.currentProgram === this.id;

        // Avoid gl call if program already in use
        if (!programActive) {
            this.gl.useProgram(this.program);
            this.gl.renderer.state.currentProgram = this.id;
        }

        // Set only the active uniforms found in the shader
        this.uniformLocations.forEach((location, activeUniform) => {
            let name = activeUniform.uniformName;

            // get supplied uniform
            let uniform = this.uniforms[name];

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
                uniform.value.update(textureUnit);
                return setUniform(this.gl, activeUniform.type, location, textureUnit);
            }

            // For texture arrays, set uniform as an array of texture units instead of just one
            if (uniform.value.length && uniform.value[0].texture) {
                const textureUnits = [];
                uniform.value.forEach((value) => {
                    textureUnit = textureUnit + 1;
                    value.update(textureUnit);
                    textureUnits.push(textureUnit);
                });

                return setUniform(this.gl, activeUniform.type, location, textureUnits);
            }

            setUniform(this.gl, activeUniform.type, location, uniform.value);
        });

        this.applyState();
        if (flipFaces) this.gl.renderer.setFrontFace(this.frontFace === this.gl.CCW ? this.gl.CW : this.gl.CCW);
    }

    remove() {
        this.refCount.value--;

        if (this.refCount.value <= 0 && !this.isDefaultProgram) {
            this.gl.deleteProgram(this.program);
        }
    }

    copy(source) {
        if (this.gl !== source.gl) {
            throw new Error('Failed to clone programs that don`t belong to the same WebGLRenderingContext');
        }

        this.id = ID++;

        // Copy program state
        this.transparent = source.transparent;
        this.cullFace = source.cullFace;
        this.frontFace = source.frontFace;
        this.depthTest = source.depthTest;
        this.depthWrite = source.depthWrite;
        this.depthFunc = source.depthFunc;
        this.blendFunc = { ...source.blendFunc };
        this.blendEquation = { ...source.blendEquation };

        this.program = source.program;
        this.uniformLocations = source.uniformLocations;
        this.attributeLocations = source.attributeLocations;
        this.attributeOrder = source.attributeOrder;

        this.uniforms = copyUniforms(source.uniforms);

        this.refCount = source.refCount;
        this.refCount.value++;
    }

    clone() {
        const clone = new Program(this.gl);
        clone.copy(this);
        return clone;
    }
}


function copyUniforms(src) {
    const srcEntries = Object.entries(src);
    const dstEntries = srcEntries.map(([prop, obj]) => {
        const cloned = obj.value?.clone ? 
            { ...obj, value: obj.value.clone() } :
            { ...obj  };

        return [prop, cloned];
    });

    return Object.fromEntries(dstEntries);
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

function addLineNumbers(string) {
    let lines = string.split('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = i + 1 + ': ' + lines[i];
    }
    return lines.join('\n');
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

const defaultVertexSource = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const defaultFragmentSource = /* glsl */ `
precision mediump float;
varying vec2 vUv;

void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}`;


// Program with only default vertex and fragment shader are cached to avoid take time on recompilation
// Cached programs also using for cheap cloning method
const defaulProgramsCache = new WeakMap();

function compileProgram(gl, vertex, fragment, debug = true) {
    if (!vertex && !fragment) {
        let programData = defaulProgramsCache.get(gl);

        if (!programData) {
            programData = compileProgram(gl, defaultVertexSource, defaultFragmentSource, false);
            programData.isDefaultProgram = true;
            defaulProgramsCache.set(gl, programData);
        }

        return programData;
    }

    vertex = vertex || defaultVertexSource;
    fragment = fragment || defaultFragmentSource;

    // compile vertex shader and log errors
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertex);
    gl.compileShader(vertexShader);

    if (debug && gl.getShaderInfoLog(vertexShader) !== '') {
        console.warn(`${gl.getShaderInfoLog(vertexShader)}\nVertex Shader\n${addLineNumbers(vertex)}`);
    }

    // compile fragment shader and log errors
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragment);
    gl.compileShader(fragmentShader);

    if (debug && gl.getShaderInfoLog(fragmentShader) !== '') {
        console.warn(`${gl.getShaderInfoLog(fragmentShader)}\nFragment Shader\n${addLineNumbers(fragment)}`);
    }

    // compile program and log errors
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (debug && !gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return console.warn(gl.getProgramInfoLog(program));
    }

    // Remove shader once linked
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    // Get active uniform locations
    const uniformLocations = new Map();
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
        const uniform = gl.getActiveUniform(program, uIndex);
        uniformLocations.set(uniform, gl.getUniformLocation(program, uniform.name));

        // split uniforms' names to separate array and struct declarations
        const split = uniform.name.match(/(\w+)/g);

        uniform.uniformName = split[0];

        if (split.length === 3) {
            uniform.isStructArray = true;
            uniform.structIndex = Number(split[1]);
            uniform.structProperty = split[2];
        } else if (split.length === 2 && isNaN(Number(split[1]))) {
            uniform.isStruct = true;
            uniform.structProperty = split[1];
        }
    }

    // Get active attribute locations
    const attributeLocations = new Map();
    const locations = [];
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

    for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
        const attribute = gl.getActiveAttrib(program, aIndex);
        const location = gl.getAttribLocation(program, attribute.name);

        locations[location] = attribute.name;
        attributeLocations.set(attribute, location);
    }

    const attributeOrder = locations.join('');

    return { program, uniformLocations, attributeLocations, attributeOrder, isDefaultProgram: false };
}