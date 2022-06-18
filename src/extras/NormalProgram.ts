import { Program } from '../core/Program.js';
import { GLContext } from '../core/Renderer.js';
import { Texture } from '../core/Texture.js';
import { Color } from '../math/Color.js';

export const vertex = /* glsl */ `
    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat3 normalMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec3 vNormal;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;
    precision highp int;

    varying vec3 vNormal;

    void main() {
        gl_FragColor.rgb = normalize(vNormal);
        gl_FragColor.a = 1.0;
    }
`;


export const vertexSimpleLight = /* glsl */ `
    precision highp float;
    precision highp int;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat3 normalMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec3 vNormal;
    varying vec2 vUV;

    void main() {
        vUV = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;


export class NormalProgram extends Program {
    constructor (gl: GLContext) {
        super(gl, {
            vertex: vertex,
            fragment: fragment,
            cullFace: null,
        })
    }
}
