export class GPGPU {
    constructor(gl: any, { data, geometry, type, }: {
        data?: Float32Array;
        geometry?: Triangle;
        type: any;
    });
    gl: any;
    passes: any[];
    geometry: Triangle;
    dataLength: number;
    size: number;
    coords: Float32Array;
    uniform: {
        value: Texture<Float32Array>;
    };
    fbo: {
        read: RenderTarget;
        write: RenderTarget;
        swap: () => void;
    };
    addPass({ vertex, fragment, uniforms, textureUniform, enabled }?: {
        vertex?: string;
        fragment?: string;
        uniforms?: {};
        textureUniform?: string;
        enabled?: boolean;
    }): {
        mesh: Mesh<Triangle, Program<never>>;
        program: Program<never>;
        uniforms: {};
        enabled: boolean;
        textureUniform: string;
    };
    render(): void;
}
import { Triangle } from "./Triangle.js";
import { Texture } from "../core/Texture.js";
import { RenderTarget } from "../core/RenderTarget.js";
import { Program } from "../core/Program.js";
import { Mesh } from "../core/Mesh.js";
