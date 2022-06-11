/**
 * Internal program data class, storing shader data for each Program instance
 * Used for reusing a native program for different Ogl programs without re-use of base shader.
 */

import { IDisposable } from "./IDisposable";
import { GLContext } from "./Renderer";
import { nextUUID } from "./uuid";

export interface IProgramSource {
    vertex: string;
    fragment: string;
}

export interface IUniformActiveInfo extends WebGLActiveInfo {
    uniformName?: string;
    isStructArray?: boolean;
    structIndex?: number;
    structProperty?: string;
    isStruct: boolean;
}

export class ProgramData implements IDisposable, IProgramSource {
    static CACHE = new WeakMap<GLContext, Map<string, ProgramData>>();

    /**
     * Create or return already existed program data for current shaders source
     */
    static create (gl: GLContext, { vertex, fragment }: IProgramSource) {
        const store = ProgramData.CACHE.get(gl);

        if (!store) return new ProgramData(gl, { vertex, fragment });

        const program = store.get(vertex + fragment);
        
        if (!program) return new ProgramData(gl, { vertex, fragment });

        program.usage ++;

        return program;
    }

    /**
     * Store program data to cache
     */
    static set (gl: GLContext, programData: ProgramData) {
        const store = this.CACHE.get(gl) || new Map();

        ProgramData.CACHE.set(gl, store);

        if (store.has(programData.vertex + programData.fragment)) {
            console.warn(
                '[ProgramData cache] Already have valid program data for this source:',
                programData.vertex,
                programData.fragment
            );
        }

        store.set(programData.key, programData);

        return programData;
    }

    /**
     * Delete program data from cache 
     */
    static delete (gl, programData) {
        if (!programData || !programData.key) return false;

        const store = ProgramData.CACHE.get(gl);

        if (!store) return false;

        return store.delete(programData.key);
    }

    public readonly id: number;
    public readonly gl: GLContext;
    public readonly vertex: string;
    public readonly fragment: string;
    public readonly uniformLocations = new Map<IUniformActiveInfo, WebGLUniformLocation>();
    public readonly attributeLocations = new Map<WebGLActiveInfo, number>();

    public program: WebGLProgram;
    public usage: number = 0;
    public attributeOrder: string = '';

    constructor(
        gl: GLContext,
        {
            vertex,
            fragment,
        }: IProgramSource
    ) {
        this.gl = gl;
        this.vertex = vertex;
        this.fragment = fragment;
        this.id = (1 << 8) + nextUUID();

        this.compile();
    }

    get key(): string {
        return this.vertex + this.fragment;
    }

    /**
     * Compile or validate exist program
     * @returns { boolean }
     */
    compile (): boolean {
        const gl = this.gl;
        const vertex = this.vertex;
        const fragment = this.fragment;

        // check that compiled program still alive
        if (this.program && gl.isProgram(this.program)) {
            return true;
        }

        // delete exist program for this context
        // it can be invalid
        ProgramData.delete(gl, this);

        // compile vertex shader and log errors
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertex);
        gl.compileShader(vertexShader);
        if (gl.getShaderInfoLog(vertexShader) !== '') {
            console.warn(`${gl.getShaderInfoLog(vertexShader)}\nVertex Shader\n${addLineNumbers(vertex)}`);
        }

        // compile fragment shader and log errors
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragment);
        gl.compileShader(fragmentShader);
        if (gl.getShaderInfoLog(fragmentShader) !== '') {
            console.warn(`${gl.getShaderInfoLog(fragmentShader)}\nFragment Shader\n${addLineNumbers(fragment)}`);
        }

        // compile program and log errors
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn(gl.getProgramInfoLog(program));
            return false;
        }

        // Remove shader once linked
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        this.program = program;
        // can be recompiled after loose
        this.uniformLocations.clear();
        this.attributeLocations.clear();

        // Get active uniform locations
        let numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
            let uniform = gl.getActiveUniform(this.program, uIndex) as IUniformActiveInfo;
            this.uniformLocations.set(uniform, gl.getUniformLocation(this.program, uniform.name));

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
        const locations = [];
        const numAttribs = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
            const attribute = gl.getActiveAttrib(this.program, aIndex);
            const location = gl.getAttribLocation(this.program, attribute.name);
            locations[location] = attribute.name;
            this.attributeLocations.set(attribute, location);
        }

        this.attributeOrder = locations.join('');

        // storing only valid programs
        ProgramData.set(gl, this);

        return true;
    }

    destroy(): void {
        this.remove();        
    }

    remove() {
        this.usage--;

        if (this.usage <= 0 && this.program) {
            this.gl.deleteProgram(this.program);

            ProgramData.delete(this.gl, this);
        }

        (this as any).id = -1;
        (this as any).fragment = null;
        (this as any).vertex = null;
        this.attributeLocations.clear();
        this.attributeOrder = '';
        this.uniformLocations.clear();
    }
}

function addLineNumbers(string) {
    let lines = string.split('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = i + 1 + ': ' + lines[i];
    }
    return lines.join('\n');
}
