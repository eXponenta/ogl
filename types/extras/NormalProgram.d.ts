import { Program } from '../core/Program.js';
import { GLContext } from '../core/Renderer.js';
export declare const vertex = "\n    precision highp float;\n    precision highp int;\n\n    attribute vec3 position;\n    attribute vec3 normal;\n    attribute vec2 uv;\n\n    uniform mat3 normalMatrix;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projectionMatrix;\n\n    varying vec3 vNormal;\n\n    void main() {\n        vNormal = normalize(normalMatrix * normal);\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }\n";
export declare const vertexSimpleLight = "\n    precision highp float;\n    precision highp int;\n\n    attribute vec3 position;\n    attribute vec3 normal;\n    attribute vec2 uv;\n\n    uniform mat3 normalMatrix;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projectionMatrix;\n\n    varying vec3 vNormal;\n    varying vec2 vUV;\n\n    void main() {\n        vUV = uv;\n        vNormal = normalize(normalMatrix * normal);\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }\n";
export declare class NormalProgram extends Program {
    constructor(gl: GLContext);
}
