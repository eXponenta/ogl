export class Post {
    constructor(gl: any, { width, height, dpr, wrapS, wrapT, minFilter, magFilter, geometry, targetOnly, }?: {
        width: any;
        height: any;
        dpr: any;
        wrapS?: any;
        wrapT?: any;
        minFilter?: any;
        magFilter?: any;
        geometry?: Triangle;
        targetOnly?: any;
    });
    gl: any;
    options: {
        wrapS: any;
        wrapT: any;
        minFilter: any;
        magFilter: any;
    };
    passes: any[];
    geometry: Triangle;
    uniform: {
        value: any;
    };
    targetOnly: any;
    fbo: {
        read: any;
        write: any;
        swap: () => void;
    };
    addPass({ vertex, fragment, uniforms, textureUniform, enabled }?: {
        vertex?: string;
        fragment?: string;
        uniforms?: {};
        textureUniform?: string;
        enabled?: boolean;
    }): {
        mesh: Mesh<Triangle, Program<"">>;
        program: Program<never>;
        uniforms: {};
        enabled: boolean;
        textureUniform: string;
    };
    resize({ width, height, dpr }?: {
        width: any;
        height: any;
        dpr: any;
    }): void;
    dpr: any;
    width: any;
    height: any;
    render({ scene, camera, texture, target, update, sort, frustumCull }: {
        scene: any;
        camera: any;
        texture: any;
        target?: any;
        update?: boolean;
        sort?: boolean;
        frustumCull?: boolean;
    }): void;
}
import { Triangle } from "./Triangle.js";
import { Program } from "../core/Program.js";
import { Mesh } from "../core/Mesh.js";
