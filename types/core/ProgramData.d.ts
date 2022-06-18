/**
 * Internal program data class, storing shader data for each Program instance
 * Used for reusing a native program for different Ogl programs without re-use of base shader.
 */
import { GLContext, INativeObjectHolder, Renderer } from "./Renderer.js";
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
export declare class ProgramData implements INativeObjectHolder, IProgramSource {
    static CACHE: WeakMap<GLContext, Map<string, ProgramData>>;
    /**
     * Create or return already existed program data for current shaders source
     */
    static create(context: Renderer, { vertex, fragment }: IProgramSource): ProgramData;
    /**
     * Store program data to cache
     */
    static set(context: Renderer, programData: ProgramData): ProgramData;
    /**
     * Delete program data from cache
     */
    static delete(gl: any, programData: any): boolean;
    activeContext: Renderer;
    readonly id: number;
    readonly vertex: string;
    readonly fragment: string;
    readonly uniformLocations: Map<IUniformActiveInfo, WebGLUniformLocation>;
    readonly attributeLocations: Map<WebGLActiveInfo, number>;
    program: WebGLProgram;
    usage: number;
    attributeOrder: string;
    constructor(_gl: GLContext, { vertex, fragment, }: IProgramSource);
    get key(): string;
    prepare({ context }: {
        context: Renderer;
    }): void;
    destroy(): void;
    remove(): void;
}
