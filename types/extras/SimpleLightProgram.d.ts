import { Program } from '../core/Program.js';
import type { GLContext } from '../core/Renderer.js';
import { Texture } from '../core/Texture.js';
import { Vec3 } from '../math/Vec3.js';
import { Color } from '../math/Color.js';
export declare const vertex = "\n    precision highp float;\n    precision highp int;\n\n    attribute vec3 position;\n    attribute vec3 normal;\n    attribute vec2 uv;\n\n    uniform mat3 normalMatrix;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 modelMatrix;\n    uniform mat4 projectionMatrix;\n\n    varying vec3 vNormal;\n    varying vec3 vPos;\n    varying vec2 vUV;\n\n    void main() {\n        vUV = uv;\n        vNormal = normalize(normalMatrix * normal);\n        vPos = vec3(modelMatrix * vec4(position, 1.0));\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }\n";
export declare const fragment = "\n    precision highp float;\n    precision highp int;\n\n    varying vec2 vUV;\n    varying vec3 vNormal;\n    varying vec3 vPos;\n\n    uniform sampler2D uTexture;\n    uniform vec3 uTint;\n    uniform vec3 uLightPos;\n    uniform vec3 uAmbientColor;\n\n    void main() {\n        vec4 color = texture2D(uTexture, vUV);\n        vec3 norm = normalize(vNormal);\n        vec3 lightDir = normalize(uLightPos - vPos);\n\n        float diff = max(dot(norm, lightDir), 0.0);\n        vec3 diffuse = diff * uAmbientColor;\n\n        color.rgb *= (uAmbientColor + diffuse) * uTint;\n\n        gl_FragColor = color;\n    }\n";
export interface ISimpleLightProg {
    texture?: Texture<any>;
    lightPos?: Vec3;
    lightColor?: Color;
    ambientColor?: Color;
    tint?: Color;
}
export declare class SimpleLightProgram extends Program<'uLightPos' | 'uLightColor' | 'uAmbientColor' | 'uTexture' | 'uTint'> {
    constructor(gl: GLContext, { texture, lightColor, ambientColor, lightPos, tint, }?: ISimpleLightProg);
    set texture(v: Texture<any>);
    get texture(): Texture<any>;
    set lightPos(v: Vec3);
    get lightPos(): Vec3;
    set lightColor(v: Color);
    get lightColor(): Color;
    set ambientColor(v: Color);
    get ambientColor(): Color;
    set tint(v: Color);
    get tint(): Color;
}
