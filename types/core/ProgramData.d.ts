/**
 * Internal program data class, storing shader data for each Program instance
 * Used for reusing a native program for different Ogl programs without re-use of base shader.
 */
import { IDisposable } from "./IDisposable";
import { GLContext } from "./Renderer.js";
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
export declare class ProgramData implements IDisposable, IProgramSource {
    static CACHE: WeakMap<GLContext, Map<string, ProgramData>>;
    /**
     * Create or return already existed program data for current shaders source
     */
    static create(gl: GLContext, { vertex, fragment }: IProgramSource): ProgramData;
    /**
     * Store program data to cache
     */
    static set(gl: GLContext, programData: ProgramData): ProgramData;
    /**
     * Delete program data from cache
     */
    static delete(gl: any, programData: any): boolean;
    readonly id: number;
    readonly gl: GLContext;
    readonly vertex: string;
    readonly fragment: string;
    readonly uniformLocations: Map<IUniformActiveInfo, WebGLUniformLocation>;
    readonly attributeLocations: Map<WebGLActiveInfo, number>;
    program: WebGLProgram;
    usage: number;
    attributeOrder: string;
    constructor(gl: GLContext, { vertex, fragment, }: IProgramSource);
    get key(): string;
    /**
     * Compile or validate exist program
     * @returns { boolean }
     */
    compile(): boolean;
    destroy(): void;
    remove(): void;
}
