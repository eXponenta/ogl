import { Program } from '../core/Program.js';
import type { GLContext } from '../core/Renderer.js';
import { Texture } from '../core/Texture.js';
import { Color } from '../math/Color.js';
export declare const vertex = "\n    precision highp float;\n    precision highp int;\n\n    attribute vec3 position;\n    attribute vec3 normal;\n    attribute vec2 uv;\n\n    uniform mat3 normalMatrix;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projectionMatrix;\n\n    varying vec3 vNormal;\n    varying vec2 vUV;\n\n    void main() {\n        vUV = uv;\n        vNormal = normalize(normalMatrix * normal);\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }\n";
export declare const fragment = "\n    precision highp float;\n    precision highp int;\n\n    varying vec2 vUV;\n    varying vec3 vNormal;\n\n    uniform vec3 uTint;\n    uniform sampler2D uTexture;\n\n    void main() {\n        vec4 color = texture2D(uTexture, vUV);\n        color.rgb *= uTint.rgb;\n\n        gl_FragColor = color;\n    }\n";
export interface IUnlitProg {
    texture?: Texture<any>;
    tint?: Color;
}
export declare class UnlitProgram extends Program<'uTint' | 'uTexture'> {
    constructor(gl: GLContext, { tint, texture, }?: IUnlitProg);
    set texture(v: Texture<any>);
    get texture(): Texture<any>;
    set tint(v: Color);
    get tint(): Color;
}
